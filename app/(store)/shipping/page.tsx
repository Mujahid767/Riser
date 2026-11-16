import type { Metadata } from "next";
import Link from "next/link";
import { SHIPPING_RATES } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Shipping Information",
  description: "Riser shipping policy — delivery timeframes, charges, and coverage across Bangladesh.",
};

export default function ShippingPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-neutral-50 border-b border-neutral-100">
        <div className="container-store py-10">
          <h1 className="section-title">Shipping Information</h1>
        </div>
      </div>
      <div className="container-store py-12 max-w-3xl">
        <div className="prose prose-neutral max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Delivery Areas & Charges</h2>
            <div className="overflow-hidden rounded-2xl border border-neutral-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    {["Area", "Delivery Charge", "Estimated Time"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left font-semibold text-neutral-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {[
                    { area: "Inside Dhaka", charge: `৳${SHIPPING_RATES.dhaka}`, time: "1–2 business days" },
                    { area: "Outside Dhaka (all other districts)", charge: `৳${SHIPPING_RATES.outsideDhaka}`, time: "3–5 business days" },
                  ].map((row) => (
                    <tr key={row.area} className="hover:bg-neutral-50/50">
                      <td className="px-5 py-3.5 font-medium text-neutral-900">{row.area}</td>
                      <td className="px-5 py-3.5 text-neutral-600">{row.charge}</td>
                      <td className="px-5 py-3.5 text-neutral-600">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Important Notes</h2>
            <ul className="space-y-3 text-neutral-600 text-sm">
              {[
                "Orders are dispatched Monday–Thursday within 24 hours of confirmation.",
                "You will be contacted by phone before delivery for confirmation.",
                "Delivery is attempted twice. If unreachable, the order may be returned.",
                "Delivery times may vary during Eid, Puja, and other major festivals.",
                "We use trusted courier services for all deliveries.",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-brand-500 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
            <p className="text-sm text-brand-900">
              Questions about your delivery?{" "}
              <Link href="/contact" className="text-brand-600 font-semibold hover:underline">
                Contact our team
              </Link>{" "}
              or call us at <a href="tel:+8801XXXXXXXXX" className="text-brand-600 font-semibold">01XXXXXXXXX</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
