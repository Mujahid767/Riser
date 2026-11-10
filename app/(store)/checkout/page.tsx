"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  {
    id: "COD",
    label: "Cash on Delivery",
    desc: "Pay when you receive your order",
    available: true,
    icon: "💵",
  },
  {
    id: "BKASH",
    label: "bKash",
    desc: "Pay via bKash mobile banking",
    available: true,
    icon: "📱",
  },
  {
    id: "NAGAD",
    label: "Nagad",
    desc: "Pay via Nagad mobile banking",
    available: true,
    icon: "📲",
  },
  {
    id: "CARD",
    label: "Credit / Debit Card",
    desc: "Coming soon",
    available: false,
    icon: "💳",
  },
];

const DIVISIONS = [
  "Dhaka", "Chattogram", "Rajshahi", "Khulna",
  "Barishal", "Sylhet", "Rangpur", "Mymensingh",
];

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Demo totals
  const subtotal = 2300;
  const deliveryCharge = 0;
  const total = subtotal + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Submit order to API
    await new Promise((r) => setTimeout(r, 1500));
    window.location.href = "/order-success";
  };

  return (
    <div className="bg-[#070709] min-h-screen py-8 text-white select-none">
      <div className="container-store">
        {/* Back */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> &larr; RETURN TO ATELIER BAG
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            {/* Contact Info */}
            <div className="bg-[#0c0c11] border border-white/10 p-6 sm:p-8">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-white pb-3 border-b border-white/10 mb-5">
                CLIENT DOSSIER
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="customerName" className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Client Full Name *
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    required
                    placeholder="e.g. Ayesha Rahman"
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="customerPhone" className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Primary Phone Number *
                  </label>
                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    className="input-field"
                  />
                  <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase">
                    For delivery confirmation & WhatsApp updates
                  </p>
                </div>
                <div>
                  <label htmlFor="customerEmail" className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    placeholder="client@domain.com"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-[#0c0c11] border border-white/10 p-6 sm:p-8">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-white pb-3 border-b border-white/10 mb-5">
                DISPATCH DESTINATION
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="addressLine" className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Delivery Address *
                  </label>
                  <textarea
                    id="addressLine"
                    name="addressLine"
                    required
                    rows={3}
                    placeholder="Apartment, building, road, sector/area..."
                    className="input-field resize-none"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    City / Thana *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    placeholder="e.g., Dhanmondi"
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    District
                  </label>
                  <input
                    id="district"
                    name="district"
                    type="text"
                    placeholder="e.g., Dhaka"
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="division" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Division
                  </label>
                  <select id="division" name="division" className="input-field">
                    <option value="">Select Division</option>
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Postal Code
                  </label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    placeholder="e.g., 1209"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-[#0c0c11] border border-white/10 p-6 sm:p-8">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-white pb-3 border-b border-white/10 mb-5">
                PAYMENT PROTOCOL
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    disabled={!method.available}
                    onClick={() => method.available && setPaymentMethod(method.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 border transition-all text-left",
                      paymentMethod === method.id && method.available
                        ? "border-white bg-white/10 text-white"
                        : method.available
                        ? "border-white/10 bg-black/40 hover:border-white/30 text-neutral-300"
                        : "border-white/5 opacity-40 cursor-not-allowed bg-black/20"
                    )}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <div className="flex-1">
                      <p className="font-mono text-xs font-bold text-white uppercase tracking-wider">{method.label}</p>
                      <p className="text-[10px] font-mono text-neutral-400 mt-0.5">{method.desc}</p>
                    </div>
                    {paymentMethod === method.id && method.available && (
                      <CheckCircle2 className="w-4 h-4 text-brand-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-[#0c0c11] border border-white/10 p-6 sm:p-8">
              <label htmlFor="customerNotes" className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                Special Atelier Directives (Optional)
              </label>
              <textarea
                id="customerNotes"
                name="customerNotes"
                rows={3}
                placeholder="Custom fitting notes, delivery timing, or gift packaging instructions..."
                className="input-field resize-none"
              />
            </div>

            {/* Submit — mobile */}
            <button
              type="submit"
              id="place-order-btn"
              disabled={isSubmitting}
              className="btn-luxury-crimson w-full py-4 text-xs lg:hidden"
            >
              {isSubmitting ? "PROCESSING DISPATCH..." : `CONFIRM ORDER — ${formatPrice(total)}`}
            </button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-[#0b0b10] border border-white/15 p-6 sm:p-8 sticky top-28">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-white pb-3 border-b border-white/10 mb-5">
                BAG DOSSIER
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {[
                  { name: "Onyx Gold Nayra Cut Kurti", size: "M", qty: 1, price: 6850 },
                  { name: "Royal Crimson Velvet Gala Baby Frock", size: "1-2Y", qty: 1, price: 3850 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 text-xs font-mono">
                    <div className="flex-1">
                      <p className="font-bold text-white uppercase">{item.name}</p>
                      <p className="text-neutral-500 text-[10px] mt-0.5">
                        FIT: {item.size} &bull; QTY: {item.qty}
                      </p>
                    </div>
                    <span className="font-bold text-white whitespace-nowrap">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>SUBTOTAL</span>
                  <span className="text-white font-bold">{formatPrice(10700)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>DISPATCH</span>
                  <span className="text-brand-400 font-bold uppercase">COMPLIMENTARY</span>
                </div>
              </div>

              <div className="border-t border-white/10 mt-4 pt-4">
                <div className="flex justify-between font-mono text-sm font-bold text-white">
                  <span>TOTAL DUE</span>
                  <span className="text-brand-400">{formatPrice(10700)}</span>
                </div>
              </div>

              {/* Submit — desktop */}
              <button
                type="submit"
                onClick={(e) => {
                  const form = document.querySelector("form");
                  if (form) form.requestSubmit();
                }}
                disabled={isSubmitting}
                className="btn-luxury-white w-full mt-6 py-4 text-xs hidden lg:block"
              >
                {isSubmitting ? "PROCESSING DISPATCH..." : `CONFIRM ORDER &rarr;`}
              </button>
            </div>
          </div>
                  <span>Delivery</span>
                  <span className="text-emerald-600 font-medium">Free 🎉</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-neutral-100">
                  <span>Total</span>
                  <span className="text-brand-600">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit — desktop */}
              <button
                form="checkout-form"
                type="submit"
                disabled={isSubmitting}
                onClick={() => {
                  document.querySelector("form")?.requestSubmit();
                }}
                className="btn-primary w-full mt-6 py-4 text-base hidden lg:flex"
              >
                {isSubmitting ? "Placing Order..." : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Place Order — {formatPrice(total)}
                  </>
                )}
              </button>

              <p className="text-xs text-center text-neutral-400 mt-3">
                🔒 Your information is secure and never shared
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
