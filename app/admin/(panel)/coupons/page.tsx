import type { Metadata } from "next";
import CouponsClient from "./coupons-client";

export const metadata: Metadata = { title: "Coupons — Riser Admin" };

export default function CouponsPage() {
  return <CouponsClient />;
}
