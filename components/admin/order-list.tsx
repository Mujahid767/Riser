"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { AdminOrder, OrderStatus } from "@/lib/orders/types";
import { ORDER_STATUSES, STATUS_LABELS, STATUS_COLORS } from "@/lib/orders/types";
import { Search, ShoppingBag } from "lucide-react";

export default function OrderList() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (debouncedSearch) params.set("search", debouncedSearch);
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    const data = (await res.json().catch(() => ({}))) as { orders?: AdminOrder[]; total?: number };
    setOrders(data.orders ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [statusFilter, debouncedSearch]);

  useEffect(() => { void fetchOrders(); }, [fetchOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Orders</h1>
        <p className="text-neutral-500 text-sm mt-1">{total} order{total !== 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order no., name, or phone…"
            className="w-full bg-admin-card border border-admin-border pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-white/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
          className="bg-admin-card border border-admin-border px-4 py-2.5 text-sm text-white outline-none"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-admin-card border border-admin-border p-12 text-center text-neutral-500">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="bg-admin-card border border-admin-border p-12 text-center">
          <ShoppingBag className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-400 font-medium">No orders yet.</p>
          <p className="text-neutral-600 text-sm mt-1">Orders from your storefront will appear here.</p>
        </div>
      ) : (
        <div className="bg-admin-card border border-admin-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  {["Order", "Customer", "Items", "Total", "Payment", "Status", "Date", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-widest whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-sm font-mono text-brand-400 hover:text-brand-300">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-white font-medium">{order.customerName}</p>
                      <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-neutral-400">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-white">৳{order.total.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 ${order.paymentStatus === "PAID" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-neutral-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                    </td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-xs text-neutral-400 hover:text-white underline">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

