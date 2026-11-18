import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Banknote,
  RotateCcw,
} from "lucide-react";
import { getAdminSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getCapiFailureSummary } from "@/lib/analytics/order-tracking";
import { getOrderAccountingDashboard } from "@/lib/orders/accounting";
import { STATUS_LABELS } from "@/lib/orders/types";

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
  RETURN_REQUESTED: "bg-orange-100 text-orange-700",
  RETURNED: "bg-rose-100 text-rose-700",
};

const PAYMENT_BADGE: Record<string, string> = {
  PAID: "bg-emerald-500/15 text-emerald-400",
  PENDING: "bg-amber-500/15 text-amber-400",
  FAILED: "bg-red-500/15 text-red-400",
  REFUNDED: "bg-rose-500/15 text-rose-400",
  PARTIALLY_REFUNDED: "bg-orange-500/15 text-orange-400",
};

function timeAgo(isoDate: string, nowMs: number): string {
  const diff = nowMs - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
}

function getDhakaGreeting(isoNow: string): string {
  // Greet using Bangladesh Standard Time (UTC+6) rather than server UTC
  const dhakaHour = new Date(new Date(isoNow).getTime() + 6 * 60 * 60 * 1000).getUTCHours();
  if (dhakaHour < 12) return "Good morning";
  if (dhakaHour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [accounting, capiAlert] = await Promise.all([
    getOrderAccountingDashboard({ recentLimit: 6 }),
    getCapiFailureSummary(),
  ]);

  const nowMs = new Date(accounting.generatedAt).getTime();
  const greeting = getDhakaGreeting(accounting.generatedAt);

  const stats = [
    {
      label: "Realized Revenue (Today)",
      value: `৳${accounting.todayRealizedRevenue.toLocaleString()}`,
      subtext: `${accounting.todaySettledOrders} settled today · Delivered & Paid only`,
      change:
        accounting.revenueChange === null
          ? null
          : `${accounting.revenueChange >= 0 ? "+" : ""}${accounting.revenueChange}%`,
      trend:
        accounting.revenueChange === null
          ? null
          : accounting.revenueChange > 0
            ? "up"
            : accounting.revenueChange < 0
              ? "down"
              : "flat",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Orders Placed (Today)",
      value: String(accounting.todayPlacedOrders),
      subtext: `Placed value ৳${accounting.todayPlacedValue.toLocaleString()} (excl. cancelled)`,
      change:
        accounting.placedOrdersChange === null
          ? null
          : `${accounting.placedOrdersChange >= 0 ? "+" : ""}${accounting.placedOrdersChange}%`,
      trend:
        accounting.placedOrdersChange === null
          ? null
          : accounting.placedOrdersChange > 0
            ? "up"
            : accounting.placedOrdersChange < 0
              ? "down"
              : "flat",
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Unpaid COD Pipeline",
      value: `৳${accounting.unpaidCodValue.toLocaleString()}`,
      subtext: `${accounting.unpaidCodCount} active unpaid order${accounting.unpaidCodCount === 1 ? "" : "s"}${accounting.unpaidDeliveredCount > 0 ? ` (${accounting.unpaidDeliveredCount} delivered awaiting cash)` : ""}`,
      change: null,
      trend: null,
      icon: Banknote,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Pending Confirmation",
      value: String(accounting.pendingCount),
      subtext: "Live orders awaiting phone confirmation",
      change: null,
      trend: null,
      icon: Clock,
      color: "bg-brand-50 text-brand-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-1">
            {greeting}! Here&apos;s Riser&apos;s live operational overview (test orders excluded).
          </p>
        </div>
        {accounting.testOrderCount > 0 && (
          <Link
            href="/admin/orders"
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-colors self-start sm:self-auto"
          >
            {accounting.testOrderCount} test order{accounting.testOrderCount === 1 ? "" : "s"} excluded from KPIs
          </Link>
        )}
      </div>

      {/* Persistent Meta CAPI failure alert */}
      {capiAlert.exhaustedCount > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-red-300">
                Meta CAPI Delivery Alert: {capiAlert.exhaustedCount} event{capiAlert.exhaustedCount > 1 ? "s" : ""} failed after automatic retries
              </p>
              <p className="text-neutral-300">
                Check your Meta Pixel ID / Conversions API access token and retry within 7 days of order activity.
                {capiAlert.recentExhausted[0]?.lastError
                  ? ` Latest error: ${capiAlert.recentExhausted[0].lastError}`
                  : ""}
              </p>
            </div>
          </div>
          <Link
            href="/admin/settings/marketing"
            className="px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-200 rounded-lg text-xs font-medium shrink-0 text-center"
          >
            Review CAPI Ledger
          </Link>
        </div>
      )}

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-admin-card rounded-2xl border border-admin-border p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-neutral-500 text-xs font-medium mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-neutral-500 text-[11px] mt-2 leading-snug">{stat.subtext}</p>
            {stat.change && (
              <div className="flex items-center gap-1 mt-2">
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

      {/* Settlement & Adjustments Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-admin-card rounded-2xl border border-admin-border px-5 py-4">
          <p className="text-neutral-500 text-xs font-medium">All-Time Realized Revenue</p>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">
            ৳{accounting.allTimeRealizedRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            {accounting.allTimeSettledOrders} Delivered &amp; Paid order{accounting.allTimeSettledOrders === 1 ? "" : "s"}
          </p>
        </div>

        <div className="bg-admin-card rounded-2xl border border-admin-border px-5 py-4">
          <p className="text-neutral-500 text-xs font-medium flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            Refunds Excluded
          </p>
          <p className="text-lg font-bold text-white mt-0.5">
            ৳{accounting.refundedValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            {accounting.fullRefundCount} full · {accounting.partialRefundCount} partial refund{accounting.partialRefundCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="bg-admin-card rounded-2xl border border-admin-border px-5 py-4">
          <p className="text-neutral-500 text-xs font-medium">Returns Excluded</p>
          <p className="text-lg font-bold text-white mt-0.5">
            ৳{accounting.returnedValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            {accounting.returnedCount} returned · {accounting.cancelledCount} cancelled
          </p>
        </div>

        <div className="bg-admin-card rounded-2xl border border-admin-border px-5 py-4">
          <p className="text-neutral-500 text-xs font-medium flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-purple-400" />
            Active Products
          </p>
          <p className="text-lg font-bold text-white mt-0.5">{accounting.productCount}</p>
          <p className="text-[11px] text-neutral-500 mt-1">
            Revenue uses settlement date (Delivered + Paid)
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Live Orders */}
        <div className="lg:col-span-2 bg-admin-card rounded-2xl border border-admin-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-admin-border">
            <div>
              <h2 className="font-semibold text-white">Recent Live Orders</h2>
              <p className="text-[11px] text-neutral-500">Test orders and cancelled revenue excluded</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              View All →
            </Link>
          </div>
          {accounting.recentOrders.length === 0 ? (
            <div className="px-6 py-10 text-center text-neutral-500 text-sm">
              No live orders yet. Orders will appear here once customers start buying.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-admin-border">
                    {["Order", "Customer", "Amount", "Status", "Payment", "Time"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {accounting.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-mono text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm text-white font-medium">{order.customerName}</p>
                          <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-white font-semibold">
                        ৳{order.total.toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`status-pill text-xs ${STATUS_COLORS[order.status] ?? "bg-neutral-100 text-neutral-600"}`}
                        >
                          {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] ?? order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${PAYMENT_BADGE[order.paymentStatus] ?? "bg-white/10 text-neutral-300"}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-neutral-500 whitespace-nowrap">
                        {timeAgo(order.createdAt, nowMs)}
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
            {accounting.lowStockProducts.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-4">
                All products are well-stocked ✓
              </p>
            ) : (
              accounting.lowStockProducts.map((item) => (
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
