import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import prisma from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  // Date boundaries
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

  const [
    todayOrders,
    yesterdayOrders,
    pendingCount,
    productCount,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    // Today's orders
    prisma.order.findMany({
      where: { createdAt: { gte: todayStart }, status: { not: "CANCELLED" } },
      select: { totalAmount: true, status: true },
    }),
    // Yesterday's orders (for change %)
    prisma.order.findMany({
      where: {
        createdAt: { gte: yesterdayStart, lt: todayStart },
        status: { not: "CANCELLED" },
      },
      select: { totalAmount: true },
    }),
    // Pending orders
    prisma.order.count({ where: { status: "PENDING" } }),
    // Total active products
    prisma.product.count({ where: { status: "ACTIVE" } }),
    // 5 most recent orders
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    }),
    // Low stock (≤ 5, still active)
    prisma.product.findMany({
      where: { status: "ACTIVE", stock: { gt: 0, lte: 5 } },
      orderBy: { stock: "asc" },
      take: 5,
      select: { id: true, name: true, stock: true },
    }),
  ]);

  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
  const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
  const revenueChange = yesterdayRevenue === 0
    ? null
    : Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100);

  return NextResponse.json({
    todayRevenue,
    todayOrders: todayOrders.length,
    revenueChange,
    pendingCount,
    productCount,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      total: Number(o.totalAmount),
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
    lowStockProducts,
  });
}
