import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Riser",
  description:
    "Learn how Riser collects, uses, and protects your personal information when you shop with us.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-neutral-50 border-b border-neutral-100">
        <div className="container-store py-10">
          <h1 className="section-title">Privacy Policy</h1>
          <p className="text-sm text-neutral-500 mt-2">
            Last updated: November 2026
          </p>
        </div>
      </div>
      <div className="container-store py-12 max-w-3xl">
        <div className="prose prose-neutral max-w-none space-y-8 text-sm text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              1. Information We Collect
            </h2>
            <p>
              When you place an order or interact with our website, we may
              collect the following information:
            </p>
            <ul className="space-y-2 mt-3 list-disc pl-5">
              <li>
                <strong>Personal details:</strong> Full name, phone number,
                email address (if provided)
              </li>
              <li>
                <strong>Delivery address:</strong> Street address, city/area,
                district
              </li>
              <li>
                <strong>Order information:</strong> Products ordered, sizes,
                quantities, order notes
              </li>
              <li>
                <strong>Device &amp; browsing data:</strong> IP address, browser
                type, pages visited, referral source (collected automatically
                via cookies)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              2. How We Use Your Information
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>To process and deliver your orders</li>
              <li>
                To contact you for order confirmation, delivery updates, or
                customer support
              </li>
              <li>To improve our website, products, and services</li>
              <li>
                To send promotional offers (only if you opt in via our
                newsletter)
              </li>
              <li>
                To analyze website traffic and shopping patterns for business
                improvements
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              3. Cookies &amp; Tracking
            </h2>
            <p>Our website uses the following tracking technologies:</p>
            <ul className="space-y-2 mt-3 list-disc pl-5">
              <li>
                <strong>Essential cookies:</strong> To remember your cart items
                and session preferences
              </li>
              <li>
                <strong>Google Analytics (GA4):</strong> To understand how
                visitors use our site. Data is anonymized and aggregated.
              </li>
              <li>
                <strong>Meta Pixel &amp; Conversions API (CAPI):</strong> To
                measure ad performance and avoid reporting unverified COD orders
                as completed purchases, we use Meta Pixel browser cookies (
                <code>_fbp</code> and <code>_fbc</code> when you click a Meta ad)
                alongside server-side Meta Conversions API events (
                <code>CODOrderPlaced</code>, <code>QualifiedOrder</code>, and{" "}
                <code>Purchase</code> after delivery and payment settlement). We
                never generate synthetic ad cookies when cookies or privacy
                signals disallow them, and we respect browser{" "}
                <strong>Do Not Track (DNT)</strong> and{" "}
                <strong>Global Privacy Control (GPC)</strong> signals.
              </li>
            </ul>
            <p className="mt-3">
              You can disable cookies in your browser settings or enable Global
              Privacy Control / Do Not Track at any time. Disabling essential
              cookies may affect cart and checkout functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              4. Data Sharing
            </h2>
            <p>
              We do <strong>not</strong> sell your personal information. We may
              share limited data with:
            </p>
            <ul className="space-y-2 mt-3 list-disc pl-5">
              <li>
                <strong>Delivery partners:</strong> Name, phone, and address for
                order fulfillment
              </li>
              <li>
                <strong>Analytics &amp; Advertising partners:</strong> Google
                Analytics (aggregated insights) and Meta Platforms (order amounts
                plus one-way SHA-256 cryptographic hashes of phone, email, name,
                and city, along with Meta click/browser identifiers when
                permitted) for conversion attribution
              </li>
              <li>
                <strong>Legal authorities:</strong> If required by Bangladeshi
                law or regulation
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              5. Data Security
            </h2>
            <p>
              We take reasonable steps to protect your personal information,
              including:
            </p>
            <ul className="space-y-2 mt-3 list-disc pl-5">
              <li>SSL/TLS encryption for all data transmitted to our servers</li>
              <li>Secure database hosting with restricted access</li>
              <li>Hashed admin credentials and rate-limited login endpoints</li>
            </ul>
            <p className="mt-3">
              While we strive to protect your information, no method of
              transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              6. Data Retention
            </h2>
            <p>
              We retain order data for as long as needed to fulfill orders,
              handle returns, and comply with legal obligations. You may request
              deletion of your personal data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              7. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="space-y-2 mt-3 list-disc pl-5">
              <li>Request access to the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal requirements)</li>
              <li>Opt out of marketing communications at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page with an updated &ldquo;Last updated&rdquo;
              date.
            </p>
          </section>

          <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
            <p className="text-sm text-brand-900">
              Questions about your privacy?{" "}
              <Link
                href="/contact"
                className="text-brand-600 font-semibold hover:underline"
              >
                Contact our team
              </Link>{" "}
              and we&apos;ll be happy to help.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
