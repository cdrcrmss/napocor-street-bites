import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const patchSchema = z.object({
    name: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    costPrice: z.number().nonnegative().optional(),
    sellPrice: z.number().nonnegative().optional(),
    stockSet: z.number().int().nonnegative().optional(),
    stockDelta: z.number().int().optional()
});

export async function PATCH(request, { params }) {
    const auth = await requireAuth(request);
    if (!auth.ok) {
        return auth.response;
    }

    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json({ error: "Invalid update payload" }, { status: 400 });
    }

    const productId = params.id;
    const found = await prisma.product.findUnique({ where: { id: productId } });
    if (!found) {
        return Response.json({ error: "Product not found" }, { status: 404 });
    }

    const updateData = {};
    const data = parsed.data;

    if (typeof data.name !== "undefined") {
        updateData.name = data.name;
    }
    if (typeof data.category !== "undefined") {
        updateData.category = data.category;
    }
    if (typeof data.costPrice !== "undefined") {
        updateData.costPrice = data.costPrice;
    }
    if (typeof data.sellPrice !== "undefined") {
        updateData.sellPrice = data.sellPrice;
    }

    if (typeof data.stockSet !== "undefined") {
        updateData.stock = data.stockSet;
    } else if (typeof data.stockDelta !== "undefined") {
        updateData.stock = Math.max(0, found.stock + data.stockDelta);
    }

    const product = await prisma.product.update({
        where: { id: productId },
        data: updateData
    });

    return Response.json({
        product: {
            ...product,
            costPrice: Number(product.costPrice),
            sellPrice: Number(product.sellPrice)
        }
    });
}

export async function DELETE(request, { params }) {
    const auth = await requireAuth(request);
    if (!auth.ok) {
        return auth.response;
    }

    const productId = params.id;

    try {
        await prisma.product.delete({ where: { id: productId } });
        return Response.json({ ok: true });
    } catch (error) {
        if (error.code === "P2025") {
            return Response.json({ error: "Product not found" }, { status: 404 });
        }

        return Response.json({ error: "Cannot delete product with sales history" }, { status: 409 });
    }
}