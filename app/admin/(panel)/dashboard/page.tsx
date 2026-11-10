import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp, ShoppingBag, Package, Users, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Clock
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — Riser Admin",
  robots: { index: false, follow: false },
};

const stats = [
  {
    label: "Today's Revenue",
    value: "৳24,850",
    change: "+18%",
    trend: "up",
    icon: TrendingUp,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    label: "Today's Orders",
    value: "32",
    change: "+5",
    trend: "up",
    icon: ShoppingBag,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Pending Orders",
    value: "12",
    change: "-3",
    trend: "down",
    icon: Clock,
    color: "text-amber-600 bg-amber-50",
  },
  {
    label: "Total Products",
    value: "48",
    change: "+6",
    trend: "up",
    icon: Package,
    color: "text-purple-600 bg-purple-50",
  },
];

const recentOrders = [
  { id: "RIS-2026-000234", customer: "Fatema Begum", phone: "01711XXXXXX", amount: 1450, status: "CONFIRMED", date: "1 min ago" },
  { id: "RIS-2026-000233", customer: "Rahima Khatun", phone: "01812XXXXXX", amount: 2200, status: "PROCESSING", date: "15 min ago" },
  { id: "RIS-2026-000232", customer: "Nasrin Akter", phone: "01912XXXXXX", amount: 850, status: "SHIPPED", date: "45 min ago" },
  { id: "RIS-2026-000231", customer: "Rokeya Sultana", phone: "01615XXXXXX", amount: 3200, status: "DELIVERED", date: "2 hours ago" },
  { id: "RIS-2026-000230", customer: "Bilkis Khanam", phone: "01512XXXXXX", amount: 950, status: "PENDING", date: "3 hours ago" },
];

const lowStockItems = [
  { name: "Pearl Celebration Dress", variant: "5-6Y / Ivory", stock: 2 },
  { name: "Velvet Party Dress", variant: "7-8Y / Burgundy", stock: 1 },
  { name: "Sequin Birthday Frock", variant: "6-7Y / Gold", stock: 3 },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  PACKED: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">
          Good morning! Here's what's happening at Riser today.
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
            <div className="flex items-center gap-1 mt-3">
              {stat.trend === "up" ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
              )}
              <span className={`text-xs font-semibold ${stat.trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                {stat.change}
              </span>
              <span className="text-neutral-600 text-xs">vs yesterday</span>
            </div>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  {["Order", "Customer", "Amount", "Status", "Time"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm font-mono text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <div>
                        <p className="text-sm text-white font-medium">{order.customer}</p>
                        <p className="text-xs text-neutral-500">{order.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-white font-semibold">
                      ৳{order.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`status-pill text-xs ${STATUS_COLORS[order.status] ?? "bg-neutral-100 text-neutral-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-neutral-500">
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-admin-card rounded-2xl border border-admin-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-admin-border">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Low Stock
            </h2>
            <Link href="/admin/inventory" className="text-xs text-brand-400 hover:text-brand-300">
              View All →
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {lowStockItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
              >
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium leading-tight truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">{item.variant}</p>
                </div>
                <span className="text-xs font-bold text-amber-400 shrink-0 bg-amber-400/10 px-2 py-1 rounded-lg">
                  {item.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
