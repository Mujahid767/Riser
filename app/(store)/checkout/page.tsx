import type { Metadata } from "next";
import CheckoutClient from "@/components/store/checkout-client";

export const metadata: Metadata = {
  title: "Checkout — Riser",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
