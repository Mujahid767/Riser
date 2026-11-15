import type { Metadata } from "next";
import { Suspense } from "react";
import OrderSuccessClient from "@/components/store/order-success-client";

export const metadata: Metadata = {
  title: "Order Received — Riser",
  robots: { index: false, follow: false },
};

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <OrderSuccessClient />
    </Suspense>
  );
}
