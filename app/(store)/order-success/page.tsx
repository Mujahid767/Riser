import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Package, Truck, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Order Placed Successfully",
  robots: { index: false, follow: false },
};

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-neutral-900 mb-3">
          Order Placed! 🎉
        </h1>
        <p className="text-neutral-600 mb-2">
          Thank you for shopping with Riser. Your order has been received.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-xl mb-8">
          <span className="text-sm text-neutral-600">Order Number:</span>
          <span className="font-bold text-neutral-900 text-sm font-mono">
            RIS-2026-000123
          </span>
        </div>

        {/* Order Steps */}
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 mb-8 text-left">
          <h2 className="font-semibold text-neutral-900 mb-4">What happens next?</h2>
          <div className="space-y-4">
            {[
              {
                icon: CheckCircle,
                title: "Order Confirmed",
                desc: "We've received your order and will confirm it shortly.",
                done: true,
              },
              {
                icon: Package,
                title: "Processing & Packing",
                desc: "Your items will be carefully packed for dispatch.",
                done: false,
              },
              {
                icon: Truck,
                title: "Out for Delivery",
                desc: "Your order will be delivered to your address.",
                done: false,
              },
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  step.done ? "bg-emerald-100" : "bg-neutral-100"
                }`}>
                  <step.icon className={`w-4 h-4 ${step.done ? "text-emerald-600" : "text-neutral-400"}`} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${step.done ? "text-emerald-700" : "text-neutral-900"}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact notice */}
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-8">
          <p className="text-sm text-brand-800">
            📱 Our team will contact you on your provided phone number to confirm your order.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/track-order" className="btn-outline-brand px-8 py-3">
            Track Order
          </Link>
          <Link href="/shop" className="btn-primary px-8 py-3">
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
