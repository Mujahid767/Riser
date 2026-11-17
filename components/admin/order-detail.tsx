"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminOrder, OrderStatus, OrderTrackingEventName, PaymentStatus } from "@/lib/orders/types";
import { ORDER_STATUSES, STATUS_LABELS, STATUS_COLORS } from "@/lib/orders/types";
import { ArrowLeft, Package, Truck, Radio, RefreshCw } from "lucide-react";

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
  const [sendingCourier, setSendingCourier] = useState(false);
  const [courierError, setCourierError] = useState("");
  const [retryingEventId, setRetryingEventId] = useState<string | null>(null);
  const [retryMsg, setRetryMsg] = useState("");

  async function retryTracking(eventIdRecord: string) {
    setRetryingEventId(eventIdRecord);
    setRetryMsg("");
    const res = await fetch("/api/admin/orders/tracking-retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: eventIdRecord }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; event?: AdminOrder["trackingEvents"] extends (infer T)[] | undefined ? T : never };
    setRetryingEventId(null);
    if (data.event) {
      setOrder((prev) => ({
        ...prev,
        trackingEvents: (prev.trackingEvents ?? []).map((ev) => (ev.id === data.event!.id ? data.event! : ev)),
      }));
    }
    if (!res.ok) {
      setRetryMsg(data.error ?? "Retry failed.");
    } else {
      setRetryMsg("CAPI event sent to Meta.");
    }
  }

  async function sendToSteadfast() {
    setSendingCourier(true);
    setCourierError("");
    const res = await fetch("/api/admin/courier/steadfast/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; order?: AdminOrder };
    setSendingCourier(false);
    if (data.order) {
      setOrder(data.order);
      if (data.order.trackingNumber) setTrackingNumber(data.order.trackingNumber);
    }
    if (!res.ok) setCourierError(data.error ?? "Could not send to Steadfast.");
  }

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

  const paymentLabel: Record<PaymentStatus, string> = {
    PENDING: "Pending",
    PAID: "Paid",
    FAILED: "Failed",
    REFUNDED: "Refunded",
    PARTIALLY_REFUNDED: "Partially Refunded",
  };

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

      {order.flags?.includes("repeat_phone_24h") && (
        <p className="text-amber-400 text-sm border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          ⚠ This phone number placed another order in the last 24 hours. Check before confirming — it may be a repeat customer or a duplicate.
        </p>
      )}
      {order.customerNote && (
        <div className="border border-white/10 bg-admin-card px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Customer note</p>
          <p className="text-sm text-white whitespace-pre-wrap">{order.customerNote}</p>
        </div>
      )}
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

          {/* Meta CAPI 3-Stage Tracking Ledger */}
          <section className="bg-admin-card border border-admin-border p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-400" /> Meta CAPI Event Ledger
              </h2>
              <span className="text-[10px] font-mono text-neutral-500">
                Purchase fires only on Delivered + Paid
              </span>
            </div>

            {retryMsg && (
              <p className={`text-xs ${retryMsg.includes("sent") ? "text-emerald-400" : "text-red-400"}`}>
                {retryMsg}
              </p>
            )}

            <div className="divide-y divide-white/10 border border-white/10">
              {(
                [
                  {
                    eventName: "CODOrderPlaced" as OrderTrackingEventName,
                    desc: "Stage 1 — Checkout submitted",
                  },
                  {
                    eventName: "QualifiedOrder" as OrderTrackingEventName,
                    desc: "Stage 2 — Staff confirmed order (Status: Confirmed)",
                  },
                  {
                    eventName: "Purchase" as OrderTrackingEventName,
                    desc: "Stage 3 — Parcel delivered & cash received (Delivered + Paid)",
                  },
                ] as const
              ).map(({ eventName, desc }) => {
                const ev = (order.trackingEvents ?? []).find((t) => t.eventName === eventName);
                const cancelledOrReturned = order.status === "CANCELLED" || order.status === "RETURNED";
                const notApplicable = !ev && cancelledOrReturned && eventName !== "CODOrderPlaced";

                return (
                  <div key={eventName} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{eventName}</span>
                        {ev ? (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono uppercase ${
                              ev.status === "SENT"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : ev.status === "FAILED"
                                  ? "bg-red-500/15 text-red-400"
                                  : "bg-amber-500/15 text-amber-400"
                            }`}
                          >
                            {ev.status} ({ev.attempts}x)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-white/5 text-neutral-400">
                            {notApplicable ? "Not applicable" : "Waiting"}
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-500 mt-0.5">{desc}</p>
                      {ev?.eventId && (
                        <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                          event_id: <span className="text-neutral-300">{ev.eventId}</span>
                          {ev.sentAt && ` · Sent ${new Date(ev.sentAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`}
                        </p>
                      )}
                      {ev?.lastError && (
                        <p className="text-[11px] text-red-400 mt-1">{ev.lastError}</p>
                      )}
                    </div>
                    {ev && ev.status !== "SENT" && (
                      <button
                        type="button"
                        onClick={() => void retryTracking(ev.id)}
                        disabled={retryingEventId === ev.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/20 text-white hover:border-white text-[10px] font-mono uppercase tracking-wider shrink-0 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${retryingEventId === ev.id ? "animate-spin" : ""}`} />
                        {retryingEventId === ev.id ? "Retrying…" : "Retry"}
                      </button>
                    )}
                  </div>
                );
              })}
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
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)} className={inputClass}>
                {(["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"] as const).map((s) => (
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

          {/* Steadfast courier */}
          <section className="bg-admin-card border border-admin-border p-5 space-y-3">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4" /> Steadfast courier
            </h2>
            {order.courier ? (
              <div className="space-y-2 text-sm">
                <p className="text-emerald-400 font-semibold">✓ Consignment created</p>
                <div className="grid grid-cols-2 gap-y-2">
                  <span className="text-neutral-500">Consignment ID</span>
                  <span className="text-white font-mono font-bold text-base">{order.courier.consignmentId}</span>
                  {order.courier.trackingCode && (
                    <>
                      <span className="text-neutral-500">Tracking code</span>
                      <span className="text-white font-mono">{order.courier.trackingCode}</span>
                    </>
                  )}
                  <span className="text-neutral-500">Status</span>
                  <span className="text-white capitalize">{order.courier.status.replace(/_/g, " ")}</span>
                  <span className="text-neutral-500">COD to collect</span>
                  <span className="text-white">৳{(order.paymentStatus === "PAID" ? 0 : order.total).toLocaleString()}</span>
                </div>
                <p className="text-xs text-neutral-500 pt-1">
                  Write the consignment ID on the parcel — Steadfast will pick it up from your shop.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-neutral-500">
                  Creates the parcel consignment in your Steadfast account (COD ৳
                  {(order.paymentStatus === "PAID" ? 0 : order.total).toLocaleString()}).
                </p>
                {courierError && <p className="text-red-400 text-sm">{courierError}</p>}
                {courierError?.includes("Settings") && (
                  <Link href="/admin/settings" className="text-xs text-white underline">Open courier settings →</Link>
                )}
                <button
                  type="button"
                  onClick={() => void sendToSteadfast()}
                  disabled={sendingCourier || order.status === "CANCELLED" || order.status === "DELIVERED"}
                  className="w-full bg-emerald-500 text-black py-3 text-xs font-bold tracking-[0.18em] uppercase disabled:opacity-50"
                >
                  {sendingCourier ? "Sending…" : "Send request to Steadfast"}
                </button>
              </>
            )}
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

