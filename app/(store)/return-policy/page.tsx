import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return & Exchange Policy — Riser",
  description:
    "Riser return and exchange policy — learn about our 3-day return window, exchange process, and refund terms.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-neutral-50 border-b border-neutral-100">
        <div className="container-store py-10">
          <h1 className="section-title">Return &amp; Exchange Policy</h1>
          <p className="text-sm text-neutral-500 mt-2">
            Last updated: November 2026
          </p>
        </div>
      </div>
      <div className="container-store py-12 max-w-3xl">
        <div className="prose prose-neutral max-w-none space-y-8 text-sm text-neutral-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Return Window
            </h2>
            <p>
              We accept returns within <strong>3 days</strong> of delivery. To
              be eligible for a return, items must be:
            </p>
            <ul className="space-y-2 mt-3 list-disc pl-5">
              <li>Unworn, unwashed, and in original condition</li>
              <li>With all tags and packaging intact</li>
              <li>Free from any alterations or damage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Exchange Policy
            </h2>
            <p>
              We offer <strong>size exchanges</strong> within the 3-day return
              window. If you need a different size:
            </p>
            <ol className="space-y-2 mt-3 list-decimal pl-5">
              <li>
                Contact us via phone or our{" "}
                <Link
                  href="/contact"
                  className="text-brand-600 font-semibold hover:underline"
                >
                  contact page
                </Link>{" "}
                within 3 days of receiving your order
              </li>
              <li>
                We&apos;ll arrange a pickup from your address (Inside Dhaka) or
                ask you to ship the item back (Outside Dhaka)
              </li>
              <li>
                Once we receive and inspect the item, we&apos;ll ship the
                replacement size
              </li>
            </ol>
            <p className="mt-3">
              Exchange is subject to stock availability. If the requested size is
              unavailable, we&apos;ll process a refund instead.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Non-Returnable Items
            </h2>
            <p>The following items are <strong>not eligible</strong> for return or exchange:</p>
            <ul className="space-y-2 mt-3 list-disc pl-5">
              <li>Sale / discounted items</li>
              <li>Bespoke or custom-tailored pieces</li>
              <li>Items marked as &ldquo;Final Sale&rdquo;</li>
              <li>Items that have been worn, washed, or altered</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Refund Process (COD Orders)
            </h2>
            <p>
              Since we currently accept <strong>Cash on Delivery (COD)</strong>{" "}
              only:
            </p>
            <ul className="space-y-2 mt-3 list-disc pl-5">
              <li>
                If you refuse delivery upon inspection, no charge is applied
              </li>
              <li>
                For returns after delivery, refunds will be issued via bKash or
                bank transfer within <strong>5–7 business days</strong> after we
                receive and inspect the returned item
              </li>
              <li>
                Delivery charges are non-refundable unless the return is due to
                a defect or error on our part
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Damaged or Defective Items
            </h2>
            <p>
              If you receive a damaged or defective item, please contact us
              immediately with photos. We will:
            </p>
            <ul className="space-y-2 mt-3 list-disc pl-5">
              <li>Arrange a free pickup and replacement at no extra cost</li>
              <li>
                If a replacement is not available, issue a full refund including
                delivery charges
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              How to Initiate a Return
            </h2>
            <div className="overflow-hidden rounded-2xl border border-neutral-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="px-5 py-3.5 text-left font-semibold text-neutral-700">
                      Step
                    </th>
                    <th className="px-5 py-3.5 text-left font-semibold text-neutral-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {[
                    {
                      step: "1",
                      action:
                        "Contact us within 3 days of delivery via phone or contact page",
                    },
                    {
                      step: "2",
                      action:
                        "Share your order number and reason for return",
                    },
                    {
                      step: "3",
                      action:
                        "Pack the item securely with tags and original packaging",
                    },
                    {
                      step: "4",
                      action:
                        "We'll arrange pickup (Dhaka) or provide return shipping instructions",
                    },
                    {
                      step: "5",
                      action:
                        "Refund or exchange processed within 5–7 business days after inspection",
                    },
                  ].map((row) => (
                    <tr key={row.step} className="hover:bg-neutral-50/50">
                      <td className="px-5 py-3.5 font-medium text-neutral-900">
                        {row.step}
                      </td>
                      <td className="px-5 py-3.5 text-neutral-600">
                        {row.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
            <p className="text-sm text-brand-900">
              Need help with a return or exchange?{" "}
              <Link
                href="/contact"
                className="text-brand-600 font-semibold hover:underline"
              >
                Contact our team
              </Link>{" "}
              or call us at{" "}
              <a
                href="tel:+8801XXXXXXXXX"
                className="text-brand-600 font-semibold"
              >
                01XXXXXXXXX
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
