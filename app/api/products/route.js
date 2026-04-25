import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const productSchema = z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    costPrice: z.number().nonnegative(),
    sellPrice: z.number().nonnegative(),
    stock: z.number().int().nonnegative()
});

export async function GET(request) {
    const auth = await requireAuth(request);
    if (!auth.ok) {
        return auth.response;
    }

    const products = await prisma.product.findMany({
        orderBy: [{ stock: "asc" }, { name: "asc" }]
    });

    return Response.json({
        products: products.map((p) => ({
            ...p,
            costPrice: Number(p.costPrice),
            sellPrice: Number(p.sellPrice)
        }))
    });
}

export async function POST(request) {
    const auth = await requireAuth(request);
    if (!auth.ok) {
        return auth.response;
    }

    const body = await request.json().catch(() => null);
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json({ error: "Invalid product payload" }, { status: 400 });
    }

    const product = await prisma.product.create({ data: parsed.data });

    return Response.json({
        product: {
            ...product,
            costPrice: Number(product.costPrice),
            sellPrice: Number(product.sellPrice)
        }
    }, { status: 201 });
}