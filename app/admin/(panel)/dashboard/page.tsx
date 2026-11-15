import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp, ShoppingBag, Package, Clock, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: "Dashboard — Riser Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  PACKED: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
}

async function getDashboardData() {
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
    prisma.order.findMany({
      where: { createdAt: { gte: todayStart }, status: { not: "CANCELLED" } },
      select: { totalAmount: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: yesterdayStart, lt: todayStart }, status: { not: "CANCELLED" } },
      select: { totalAmount: true },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
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
    prisma.product.findMany({
      where: { status: "ACTIVE", stock: { gt: 0, lte: 5 } },
      orderBy: { stock: "asc" },
      take: 5,
      select: { id: true, name: true, stock: true },
    }),
  ]);

  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
  const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
  const revenueChange =
    yesterdayRevenue === 0
      ? null
      : Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100);

  return {
    todayRevenue,
    todayOrderCount: todayOrders.length,
    revenueChange,
    pendingCount,
    productCount,
    recentOrders,
    lowStockProducts,
  };
}

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const data = await getDashboardData();
  const { todayRevenue, todayOrderCount, revenueChange, pendingCount, productCount, recentOrders, lowStockProducts } = data;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const stats = [
    {
      label: "Today's Revenue",
      value: `৳${todayRevenue.toLocaleString()}`,
      change: revenueChange === null ? null : `${revenueChange >= 0 ? "+" : ""}${revenueChange}%`,
      trend: revenueChange === null ? "neutral" : revenueChange >= 0 ? "up" : "down",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Today's Orders",
      value: String(todayOrderCount),
      change: null,
      trend: "neutral",
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Pending Orders",
      value: String(pendingCount),
      change: null,
      trend: pendingCount > 10 ? "up" : "neutral",
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Active Products",
      value: String(productCount),
      change: null,
      trend: "neutral",
      icon: Package,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">
          {greeting}! Here&apos;s what&apos;s happening at Riser today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-admin-card rounded-2xl border border-admin-border p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-neutral-500 text-xs font-medium mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            {stat.change && (
              <div className="flex items-center gap-1 mt-3">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                ) : stat.trend === "down" ? (
                  <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Minus className="w-3.5 h-3.5 text-neutral-500" />
                )}
                <span
                  className={`text-xs font-semibold ${
                    stat.trend === "up"
                      ? "text-emerald-400"
                      : stat.trend === "down"
                      ? "text-red-400"
                      : "text-neutral-500"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-neutral-600 text-xs">vs yesterday</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-admin-card rounded-2xl border border-admin-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-admin-border">
            <h2 className="font-semibold text-white">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              View All →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-6 py-10 text-center text-neutral-500 text-sm">
              No orders yet. Orders will appear here once customers start buying.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-admin-border">
                    {["Order", "Customer", "Amount", "Status", "Time"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-mono text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-3">
                        <div>
                          <p className="text-sm text-white font-medium">{order.customerName}</p>
                          <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-white font-semibold">
                        ৳{Number(order.totalAmount).toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`status-pill text-xs ${STATUS_COLORS[order.status] ?? "bg-neutral-100 text-neutral-600"}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-neutral-500">
                        {timeAgo(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-admin-card rounded-2xl border border-admin-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-admin-border">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Low Stock
            </h2>
            <Link href="/admin/products?stock=low" className="text-xs text-brand-400 hover:text-brand-300">
              View All →
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-4">
                All products are well-stocked ✓
              </p>
            ) : (
              lowStockProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/products/${item.id}`}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-colors block"
                >
                  <p className="text-sm text-white font-medium leading-tight truncate">
                    {item.name}
                  </p>
                  <span className="text-xs font-bold text-amber-400 shrink-0 bg-amber-400/10 px-2 py-1 rounded-lg">
                    {item.stock} left
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
