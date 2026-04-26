import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    try {
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
    } catch (error) {
        console.error("GET /api/products failed", error);
        return Response.json({
            error: "Failed to load inventory from database. Check DATABASE_URL and run prisma db push on deployment."
        }, { status: 500 });
    }
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

    try {
        const product = await prisma.product.create({ data: parsed.data });

        return Response.json({
            product: {
                ...product,
                costPrice: Number(product.costPrice),
                sellPrice: Number(product.sellPrice)
            }
        }, { status: 201 });
    } catch (error) {
        console.error("POST /api/products failed", error);
        return Response.json({
            error: "Failed to save item to database. Check deployment database connection."
        }, { status: 500 });
    }
}