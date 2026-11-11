"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminOrder, OrderStatus } from "@/lib/orders/types";
import { ORDER_STATUSES, STATUS_LABELS, STATUS_COLORS } from "@/lib/orders/types";
import { ArrowLeft, Package } from "lucide-react";

const inputClass = "w-full bg-black/40 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-white/50";

export default function OrderDetailClient({ order: initial }: { order: AdminOrder }) {
  const router = useRouter();
  const [order, setOrder] = useState(initial);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "");
  const [note, setNote] = useState(order.note ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch(`/api/admin/orders?id=${order.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, paymentStatus, trackingNumber, note }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; order?: AdminOrder };
    setSaving(false);
    if (!res.ok || !data.order) {
      setError(data.error ?? "Could not update order.");
      return;
    }
    setOrder(data.order);
    setSaved(true);
  }

  const paymentLabel = { PENDING: "Pending", PAID: "Paid", FAILED: "Failed", REFUNDED: "Refunded" };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="text-neutral-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white font-mono">{order.orderNumber}</h1>
            <p className="text-neutral-500 text-sm mt-0.5">
              Placed {new Date(order.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
        <span className={`text-sm font-semibold px-3 py-1.5 self-start ${STATUS_COLORS[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {saved && <p className="text-emerald-400 text-sm">Order updated successfully.</p>}

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Left */}
        <div className="space-y-5">
          {/* Items */}
          <section className="bg-admin-card border border-admin-border p-5 space-y-4">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Items ordered</h2>
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-12 h-14 bg-black border border-white/10 shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-neutral-700 m-auto mt-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium leading-tight">{item.productName}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Size: {item.size} · {item.color} · Qty: {item.qty}
                  </p>
                </div>
                <p className="text-sm font-semibold text-white shrink-0">
                  ৳{(item.unitPrice * item.qty).toLocaleString()}
                </p>
              </div>
            ))}
            <div className="pt-3 border-t border-white/10 space-y-1.5">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Subtotal</span>
                <span>৳{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Shipping</span>
                <span>৳{order.shippingFee.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Discount</span>
                  <span>-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white pt-1">
                <span>Total</span>
                <span>৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Customer & delivery */}
          <section className="bg-admin-card border border-admin-border p-5 space-y-3">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Customer & delivery</h2>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <p className="text-neutral-500 text-xs mb-0.5">Name</p>
                <p className="text-white">{order.customerName}</p>
              </div>
              <div>
                <p className="text-neutral-500 text-xs mb-0.5">Phone</p>
                <p className="text-white">{order.customerPhone}</p>
              </div>
              {order.customerEmail && (
                <div>
                  <p className="text-neutral-500 text-xs mb-0.5">Email</p>
                  <p className="text-white">{order.customerEmail}</p>
                </div>
              )}
              <div>
                <p className="text-neutral-500 text-xs mb-0.5">District</p>
                <p className="text-white">{order.district}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-neutral-500 text-xs mb-0.5">Address</p>
                <p className="text-white">{order.address}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right — update panel */}
        <div className="space-y-5">
          <section className="bg-admin-card border border-admin-border p-5 space-y-5">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Update order</h2>

            <label className="block space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500">Order status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)} className={inputClass}>
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500">Payment status</span>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as AdminOrder["paymentStatus"])} className={inputClass}>
                {(["PENDING", "PAID", "FAILED", "REFUNDED"] as const).map((s) => (
                  <option key={s} value={s}>{paymentLabel[s]}</option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500">Tracking number</span>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. SA123456789BD"
                className={inputClass}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500">Internal note</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Visible only to admin…"
                className={inputClass}
              />
            </label>

            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="w-full bg-white text-black py-3 text-xs font-bold tracking-[0.18em] uppercase disabled:opacity-60"
            >
              {saving ? "Saving…" : "Update order"}
            </button>
          </section>

          <section className="bg-admin-card border border-admin-border p-5 space-y-2">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Payment</h2>
            <div className="text-sm grid grid-cols-2 gap-y-2">
              <span className="text-neutral-500">Method</span>
              <span className="text-white">{order.paymentMethod}</span>
              <span className="text-neutral-500">Status</span>
              <span className={`font-semibold ${order.paymentStatus === "PAID" ? "text-emerald-400" : "text-amber-400"}`}>
                {paymentLabel[order.paymentStatus]}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

