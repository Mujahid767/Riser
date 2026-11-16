import type { Metadata } from "next";
import Link from "next/link";
import { getSiteContent } from "@/lib/cms/store";
import { SHIPPING_RATES } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Terms & Conditions — Riser",
  description: "Terms of service, ordering, delivery, and exchange terms for Riser.",
};

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const { contact } = await getSiteContent();
  const phone = contact?.phone || "+880 1577-049566";
  const email = contact?.email || "riserclothingshop@gmail.com";
  const factoryEn = contact?.factoryAddress || "Mahmudpur, Signboard, Narayanganj, Bangladesh";

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-neutral-50 border-b border-neutral-100">
        <div className="container-store py-10">
          <h1 className="section-title">Terms &amp; Conditions</h1>
          <p className="text-sm text-neutral-500 mt-2">
            Manufactured in our own garments facility ({factoryEn})
          </p>
        </div>
      </div>

      <div className="container-store py-12 max-w-3xl">
        <div className="prose prose-neutral max-w-none space-y-8 text-sm text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">1. Direct Manufacturer Guarantee</h2>
            <p>
              All products sold on this website and across our 7 Dhaka retail outlets are manufactured in Riser&apos;s own garments facility at{" "}
              <strong>{factoryEn}</strong>. Product photos represent actual pieces produced by our studio; slight variations in hand-embroidery or screen calibration may occur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">2. Pricing &amp; Size-Specific Rates</h2>
            <p>
              All prices are listed in Bangladeshi Taka (BDT / ৳). Because fabric and embroidery consumption varies by length (from 16 inches for Age 1 up to 38 inches for Age 12 and adult sizes), prices may vary by selected size range as displayed on each product page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">3. Orders, Delivery &amp; Cash on Delivery</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong>Inside Dhaka:</strong> ৳{SHIPPING_RATES.dhaka} delivery charge (1–2 business days).
              </li>
              <li>
                <strong>Outside Dhaka (All 64 Districts):</strong> ৳{SHIPPING_RATES.outsideDhaka} delivery charge (3–5 business days via Steadfast Courier).
              </li>
              <li>
                <strong>International &amp; Wholesale Orders:</strong> International shipping rates and bulk export terms are quoted directly via WhatsApp ({phone}) or email ({email}).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">4. Exchanges &amp; Returns</h2>
            <p>
              Customers may inspect the parcel in front of the delivery rider. Size exchanges and returns are governed by our{" "}
              <Link href="/return-policy" className="text-brand-600 font-semibold hover:underline">
                Return &amp; Exchange Policy
              </Link>
              .
            </p>
          </section>

          <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
            <p className="text-sm text-brand-900">
              Questions about retail or international wholesale terms? Call or WhatsApp us at{" "}
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-brand-600 font-semibold hover:underline">
                {phone}
              </a>{" "}
              or email{" "}
              <a href={`mailto:${email}`} className="text-brand-600 font-semibold hover:underline">
                {email}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
