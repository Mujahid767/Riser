"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { clearCart, syncCartFromServer, useCart } from "@/lib/cart/cart-store";
import { calculateShipping, DISTRICTS } from "@/lib/shipping";

const PAYMENT_METHODS = [
  { id: "COD", label: "Cash on Delivery", desc: "Pay in cash when your order arrives", available: true },
  { id: "BKASH", label: "bKash", desc: "Coming soon", available: false },
  { id: "NAGAD", label: "Nagad", desc: "Coming soon", available: false },
  { id: "CARD", label: "Credit / Debit Card", desc: "Coming soon", available: false },
];

type Fields = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  district: string;
  area: string;
  addressLine: string;
  customerNotes: string;
  website: string; // honeypot
};

const EMPTY_FIELDS: Fields = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  district: "",
  area: "",
  addressLine: "",
  customerNotes: "",
  website: "",
};

const KEY_STORAGE = "riser:checkout-key";
const LAST_ORDER_STORAGE = "riser:last-order";

function getIdempotencyKey(): string {
  try {
    const existing = window.sessionStorage.getItem(KEY_STORAGE);
    if (existing) return existing;
    const fresh =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `k-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(KEY_STORAGE, fresh);
    return fresh;
  } catch {
    return `k-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  }
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-[11px] font-mono text-red-400 mt-1">
      {message}
    </p>
  );
}

const labelClass = "block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5";
const cardClass = "bg-[#0c0c11] border border-white/10 p-6 sm:p-8";
const headingClass =
  "font-mono text-xs font-bold uppercase tracking-[0.25em] text-white pb-3 border-b border-white/10 mb-5";

export default function CheckoutClient() {
  const router = useRouter();
  const { lines, subtotal } = useCart();
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [cartNotes, setCartNotes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const shipping = useMemo(
    () => (fields.district ? calculateShipping(fields.district, subtotal) : null),
    [fields.district, subtotal]
  );
  const total = subtotal + (shipping ?? 0);

  const set = (name: keyof Fields) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFields((f) => ({ ...f, [name]: e.target.value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || placed || lines.length === 0) return;

    const clientErrors: Record<string, string> = {};
    if (fields.customerName.trim().length < 2) clientErrors.customerName = "Enter your full name";
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(fields.customerPhone.replace(/[\s\-()]/g, "")))
      clientErrors.customerPhone = "Enter a valid mobile number (01XXXXXXXXX)";
    if (!fields.district) clientErrors.district = "Select your district";
    if (fields.area.trim().length < 2) clientErrors.area = "Enter your thana / area";
    if (fields.addressLine.trim().length < 5) clientErrors.addressLine = "Enter your full address";
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      setFormError("Please check the highlighted fields.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setCartNotes([]);
    setErrors({});

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: getIdempotencyKey(),
          website: fields.website,
          customerName: fields.customerName,
          customerPhone: fields.customerPhone,
          customerEmail: fields.customerEmail,
          district: fields.district,
          area: fields.area,
          addressLine: fields.addressLine,
          customerNotes: fields.customerNotes || undefined,
          paymentMethod: "COD",
          expectedTotal: total,
          items: lines.map((l) => ({
            productId: l.productId,
            size: l.size,
            color: l.color,
            qty: l.qty,
          })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
        fieldErrors?: Record<string, string>;
        orderNumber?: string;
        total?: number;
        subtotal?: number;
        shippingFee?: number;
        lines?: { key: string; unitPrice: number; maxQty: number | null; available: boolean; reason?: string }[];
      };

      if (res.ok && data.orderNumber) {
        try {
          window.sessionStorage.setItem(
            LAST_ORDER_STORAGE,
            JSON.stringify({
              orderNumber: data.orderNumber,
              total: data.total,
              subtotal: data.subtotal,
              shippingFee: data.shippingFee,
              district: fields.district,
              items: lines.map((l) => ({ name: l.name, size: l.size, color: l.color, qty: l.qty, price: l.price })),
            })
          );
          window.sessionStorage.removeItem(KEY_STORAGE);
        } catch {
          /* summary is a nicety — the order itself is saved */
        }
        setPlaced(true);
        clearCart();
        router.push(`/order-success?order=${encodeURIComponent(data.orderNumber)}`);
        return;
      }

      if (res.status === 409 && data.lines) {
        const notes = data.lines
          .filter((l) => l.reason || !l.available)
          .map((l) => {
            const line = lines.find((x) => x.key === l.key);
            return `${line?.name ?? "An item"}: ${l.reason ?? "no longer available"}`;
          });
        syncCartFromServer(data.lines);
        setCartNotes(notes);
        setFormError(data.error ?? "Your bag was updated. Please review and confirm again.");
      } else if (data.fieldErrors) {
        setErrors(data.fieldErrors);
        setFormError(data.error ?? "Please check the highlighted fields.");
      } else {
        setFormError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setFormError("Network problem — your order was NOT placed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated || placed) {
    return (
      <div className="bg-[#070709] min-h-screen text-white flex items-center justify-center">
        <p className="text-xs font-mono uppercase tracking-widest text-neutral-500">
          {placed ? "Order placed — redirecting…" : "Loading…"}
        </p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="bg-[#070709] min-h-screen text-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShoppingBag className="w-14 h-14 mx-auto text-neutral-600 mb-4" />
          <h1 className="text-xl font-bold uppercase tracking-wider mb-2">Your bag is empty</h1>
          {cartNotes.length > 0 && (
            <p className="text-xs text-amber-400 font-mono mb-4">{cartNotes.join(" · ")}</p>
          )}
          <p className="text-xs text-neutral-400 mb-6">Add something to your bag to check out.</p>
          <Link href="/shop" className="btn-luxury-white px-8">
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#070709] min-h-screen py-8 text-white">
      <div className="container-store">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white mb-8 transition-colors"
        >
          &larr; BACK TO BAG
        </Link>

        <form id="checkout-form" onSubmit={handleSubmit} noValidate className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {(formError || cartNotes.length > 0) && (
              <div role="alert" className="border border-red-500/40 bg-red-500/10 p-4 text-xs font-mono text-red-300 space-y-1">
                {formError && <p>{formError}</p>}
                {cartNotes.map((n) => (
                  <p key={n} className="text-red-200">• {n}</p>
                ))}
              </div>
            )}

            {/* Contact */}
            <div className={cardClass}>
              <h2 className={headingClass}>CONTACT</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="customerName" className={labelClass}>Full name *</label>
                  <input id="customerName" autoComplete="name" value={fields.customerName} onChange={set("customerName")} placeholder="e.g. Ayesha Rahman" className="input-field" />
                  <FieldError message={errors.customerName} />
                </div>
                <div>
                  <label htmlFor="customerPhone" className={labelClass}>Mobile number *</label>
                  <input id="customerPhone" type="tel" inputMode="tel" autoComplete="tel" value={fields.customerPhone} onChange={set("customerPhone")} placeholder="01XXXXXXXXX" className="input-field" />
                  <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase">We call/WhatsApp to confirm your order</p>
                  <FieldError message={errors.customerPhone} />
                </div>
                <div>
                  <label htmlFor="customerEmail" className={labelClass}>Email (optional)</label>
                  <input id="customerEmail" type="email" autoComplete="email" value={fields.customerEmail} onChange={set("customerEmail")} placeholder="you@example.com" className="input-field" />
                  <FieldError message={errors.customerEmail} />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className={cardClass}>
              <h2 className={headingClass}>DELIVERY ADDRESS</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="district" className={labelClass}>District *</label>
                  <select id="district" autoComplete="address-level1" value={fields.district} onChange={set("district")} className="input-field">
                    <option value="">Select district</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <FieldError message={errors.district} />
                </div>
                <div>
                  <label htmlFor="area" className={labelClass}>Thana / Area *</label>
                  <input id="area" autoComplete="address-level2" value={fields.area} onChange={set("area")} placeholder="e.g. Dhanmondi" className="input-field" />
                  <FieldError message={errors.area} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="addressLine" className={labelClass}>Full address *</label>
                  <textarea id="addressLine" rows={3} autoComplete="street-address" value={fields.addressLine} onChange={set("addressLine")} placeholder="House, road, block / village, landmark…" className="input-field resize-none" />
                  <FieldError message={errors.addressLine} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className={cardClass}>
              <h2 className={headingClass}>PAYMENT</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 border text-left",
                      m.available ? "border-white bg-white/10" : "border-white/5 opacity-40 bg-black/20"
                    )}
                  >
                    <div className="flex-1">
                      <p className="font-mono text-xs font-bold text-white uppercase tracking-wider">{m.label}</p>
                      <p className="text-[10px] font-mono text-neutral-400 mt-0.5">{m.desc}</p>
                    </div>
                    {m.available && <CheckCircle2 className="w-4 h-4 text-brand-500" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className={cardClass}>
              <label htmlFor="customerNotes" className={labelClass}>Order notes (optional)</label>
              <textarea id="customerNotes" rows={3} maxLength={500} value={fields.customerNotes} onChange={set("customerNotes")} placeholder="Delivery timing, gift packaging, special instructions…" className="input-field resize-none" />
            </div>

            {/* Honeypot — hidden from people, bots tend to fill it */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" value={fields.website} onChange={set("website")} />
              </label>
            </div>

            <button type="submit" disabled={submitting} className="btn-luxury-crimson w-full py-4 text-xs lg:hidden disabled:opacity-60">
              {submitting ? "PLACING ORDER…" : `PLACE ORDER — ${formatPrice(total)}`}
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#0b0b10] border border-white/15 p-6 sm:p-8 lg:sticky lg:top-28">
              <h2 className={headingClass}>ORDER SUMMARY</h2>

              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-1">
                {lines.map((l) => (
                  <div key={l.key} className="flex items-start gap-3 text-xs font-mono">
                    <div className="w-12 h-16 relative border border-white/10 bg-black shrink-0 overflow-hidden">
                      {l.imageUrl && <Image src={l.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white uppercase line-clamp-2">{l.name}</p>
                      <p className="text-neutral-500 text-[10px] mt-0.5 uppercase">
                        {[l.size && `Size ${l.size}`, l.color, `Qty ${l.qty}`].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                    <span className="font-bold text-white whitespace-nowrap">{formatPrice(l.price * l.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>SUBTOTAL</span>
                  <span className="text-white font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>DELIVERY</span>
                  <span className="text-white font-bold">
                    {shipping === null ? "Select district" : shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/10 mt-4 pt-4 flex justify-between font-mono text-sm font-bold text-white">
                <span>TOTAL TO PAY</span>
                <span className="text-brand-400">{formatPrice(total)}</span>
              </div>
              <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase">Pay cash when you receive your order</p>

              <button type="submit" disabled={submitting} className="btn-luxury-white w-full mt-6 py-4 text-xs hidden lg:block disabled:opacity-60">
                {submitting ? "PLACING ORDER…" : "PLACE ORDER →"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
