import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getPeriodStart } from "@/lib/period";

export const dynamic = "force-dynamic";

async function summarizeSince(dateStart) {
    const result = await prisma.sale.aggregate({
        _sum: {
            subtotal: true,
            totalProfit: true
        },
        _count: {
            id: true
        },
        where: {
            ...(dateStart ? { createdAt: { gte: dateStart } } : {})
        }
    });

    return {
        amount: Number(result._sum.subtotal || 0),
        profit: Number(result._sum.totalProfit || 0),
        transactions: result._count.id
    };
}

export async function GET(request) {
    const auth = await requireAuth(request);
    if (!auth.ok) {
        return auth.response;
    }

    try {
        const dayStart = getPeriodStart("day");
        const weekStart = getPeriodStart("week");
        const monthStart = getPeriodStart("month");

        const [day, week, month, topItemsRows] = await Promise.all([
            summarizeSince(dayStart),
            summarizeSince(weekStart),
            summarizeSince(monthStart),
            prisma.saleItem.groupBy({
                by: ["name"],
                _sum: {
                    quantity: true
                },
                where: {
                    sale: {
                        createdAt: {
                            gte: monthStart
                        }
                    }
                },
                orderBy: {
                    _sum: {
                        quantity: "desc"
                    }
                },
                take: 5
            })
        ]);

        const topItems = topItemsRows.map((row) => ({
            name: row.name,
            quantity: row._sum.quantity || 0
        }));

        return Response.json({
            day,
            week,
            month,
            topItems
        });
    } catch (error) {
        console.error("GET /api/analytics failed", error);
        return Response.json({ error: "Failed to load analytics data." }, { status: 500 });
    }
}