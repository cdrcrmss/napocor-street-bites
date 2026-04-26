import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { formatReceiptCode, getPeriodStart } from "@/lib/period";

export const dynamic = "force-dynamic";

const saleQuerySchema = z.object({
    period: z.enum(["all", "day", "week", "month"]).default("all"),
    search: z.string().optional()
});

const checkoutSchema = z.object({
    items: z
        .array(
            z.object({
                productId: z.string().min(1),
                quantity: z.number().int().positive()
            })
        )
        .min(1),
    cashReceived: z.number().nonnegative().optional()
});

function saleToJson(sale) {
    return {
        ...sale,
        subtotal: Number(sale.subtotal),
        totalProfit: Number(sale.totalProfit),
        cashReceived: sale.cashReceived === null ? null : Number(sale.cashReceived),
        changeGiven: sale.changeGiven === null ? null : Number(sale.changeGiven),
        items: sale.items.map((item) => ({
            ...item,
            costPrice: Number(item.costPrice),
            sellPrice: Number(item.sellPrice),
            lineTotal: Number(item.lineTotal),
            lineProfit: Number(item.lineProfit)
        }))
    };
}

export async function GET(request) {
    const auth = await requireAuth(request);
    if (!auth.ok) {
        return auth.response;
    }

    try {
        const { searchParams } = new URL(request.url);
        const periodParam = searchParams.get("period");
        const searchParam = searchParams.get("search");
        const parsed = saleQuerySchema.safeParse({
            period: periodParam ? periodParam : "all",
            search: searchParam ? searchParam : undefined
        });

        if (!parsed.success) {
            return Response.json({ error: "Invalid query" }, { status: 400 });
        }

        const periodStart = getPeriodStart(parsed.data.period);
        const search = parsed.data.search ? parsed.data.search.trim() : undefined;

        const sales = await prisma.sale.findMany({
            where: {
                ...(periodStart ? { createdAt: { gte: periodStart } } : {}),
                ...(search ? { receiptCode: { contains: search, mode: "insensitive" } } : {})
            },
            include: {
                items: {
                    orderBy: { name: "asc" }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return Response.json({ sales: sales.map(saleToJson) });
    } catch (error) {
        console.error("GET /api/sales failed", error);
        return Response.json({ error: "Failed to load sales history." }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = await requireAuth(request);
    if (!auth.ok) {
        return auth.response;
    }

    const body = await request.json().catch(() => null);
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json({ error: "Invalid checkout payload" }, { status: 400 });
    }

    const merged = new Map();
    for (const item of parsed.data.items) {
        merged.set(item.productId, (merged.get(item.productId) || 0) + item.quantity);
    }

    const normalizedItems = Array.from(merged.entries()).map(([productId, quantity]) => ({
        productId,
        quantity
    }));

    const cashReceived =
        typeof parsed.data.cashReceived === "number" ? parsed.data.cashReceived : null;

    try {
        const result = await prisma.$transaction(async(tx) => {
            const productIds = normalizedItems.map((item) => item.productId);
            const products = await tx.product.findMany({
                where: { id: { in: productIds } }
            });

            if (products.length !== productIds.length) {
                throw new Error("Some products were not found.");
            }

            const productMap = new Map(products.map((product) => [product.id, product]));

            let subtotal = 0;
            let totalProfit = 0;
            const saleItemsData = [];

            for (const line of normalizedItems) {
                const product = productMap.get(line.productId);
                if (!product) {
                    throw new Error("Product not found.");
                }

                if (product.stock < line.quantity) {
                    throw new Error(`Not enough stock for ${product.name}.`);
                }

                const sellPrice = Number(product.sellPrice);
                const costPrice = Number(product.costPrice);
                const lineTotal = sellPrice * line.quantity;
                const lineProfit = (sellPrice - costPrice) * line.quantity;

                subtotal += lineTotal;
                totalProfit += lineProfit;

                saleItemsData.push({
                    productId: product.id,
                    name: product.name,
                    category: product.category,
                    quantity: line.quantity,
                    costPrice,
                    sellPrice,
                    lineTotal,
                    lineProfit
                });

                await tx.product.update({
                    where: { id: product.id },
                    data: { stock: { decrement: line.quantity } }
                });
            }

            if (cashReceived !== null && cashReceived < subtotal) {
                throw new Error("Cash received is less than subtotal.");
            }

            const sale = await tx.sale.create({
                data: {
                    receiptCode: formatReceiptCode(),
                    subtotal,
                    totalProfit,
                    cashReceived,
                    changeGiven: cashReceived === null ? null : cashReceived - subtotal,
                    items: {
                        create: saleItemsData
                    }
                },
                include: {
                    items: {
                        orderBy: { name: "asc" }
                    }
                }
            });

            return sale;
        });

        return Response.json({ sale: saleToJson(result) }, { status: 201 });
    } catch (error) {
        return Response.json({ error: error.message || "Checkout failed." }, { status: 400 });
    }
}