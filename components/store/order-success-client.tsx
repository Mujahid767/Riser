"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, Truck, Phone } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type LastOrder = {
  orderNumber: string;
  total?: number;
  subtotal?: number;
  shippingFee?: number;
  district?: string;
  items?: { name: string; size: string; color: string; qty: number; price: number }[];
};

export default function OrderSuccessClient() {
  const params = useSearchParams();
  const orderNumber = params.get("order") ?? "";
  const [summary, setSummary] = useState<LastOrder | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("riser:last-order");
      if (!raw) return;
      const parsed = JSON.parse(raw) as LastOrder;
      if (parsed.orderNumber === orderNumber) setSummary(parsed);
    } catch {
      /* no summary available — order number is enough */
    }
  }, [orderNumber]);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        <div className="text-center">
          <div className="w-20 h-20 border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider mb-3">Order received</h1>
          <p className="text-neutral-400 text-sm mb-6">
            Thank you for shopping with Riser. We&apos;ll call you shortly to confirm your order.
          </p>
          {orderNumber && (
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-white/15 bg-white/5 mb-8">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Order no.</span>
              <span className="font-bold text-sm font-mono">{orderNumber}</span>
            </div>
          )}
        </div>

        {summary?.items && (
          <div className="bg-[#0c0c11] border border-white/10 p-6 mb-6 text-xs font-mono space-y-3">
            {summary.items.map((it, i) => (
              <div key={i} className="flex justify-between gap-3">
                <span className="text-neutral-300 uppercase">
                  {it.name}
                  <span className="text-neutral-500">
                    {" "}
                    · {[it.size, it.color].filter(Boolean).join(" / ")} × {it.qty}
                  </span>
                </span>
                <span className="font-bold whitespace-nowrap">{formatPrice(it.price * it.qty)}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-3 space-y-1.5">
              <div className="flex justify-between text-neutral-400">
                <span>DELIVERY{summary.district ? ` (${summary.district.toUpperCase()})` : ""}</span>
                <span>{formatPrice(summary.shippingFee ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span>PAY ON DELIVERY</span>
                <span className="text-brand-400">{formatPrice(summary.total ?? 0)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#0c0c11] border border-white/10 p-6 mb-8">
          <h2 className="font-mono text-xs font-bold uppercase tracking-[0.25em] mb-4">What happens next</h2>
          <div className="space-y-4">
            {[
              { icon: Phone, title: "We confirm by phone", desc: "Keep your phone nearby — our team will call or WhatsApp you." },
              { icon: Package, title: "Packed with care", desc: "Once confirmed, your order is packed for dispatch." },
              { icon: Truck, title: "Delivered to your door", desc: "Pay in cash when it arrives." },
            ].map((step) => (
              <div key={step.title} className="flex items-start gap-3">
                <div className="w-8 h-8 border border-white/15 flex items-center justify-center shrink-0">
                  <step.icon className="w-4 h-4 text-neutral-300" />
                </div>
                <div>
                  <p className="text-sm font-bold">{step.title}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/track-order" className="btn-luxury-outline flex-1 text-center py-3 text-xs">TRACK ORDER</Link>
          <Link href="/shop" className="btn-luxury-white flex-1 text-center py-3 text-xs">CONTINUE SHOPPING</Link>
        </div>
      </div>
    </div>
  );
}
