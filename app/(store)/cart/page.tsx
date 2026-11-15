import type { Metadata } from "next";
import CartClient from "@/components/store/cart-client";

export const metadata: Metadata = {
  title: "Shopping Bag — Riser",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartClient />;
}
