import type { Metadata } from "next";
import OrderList from "@/components/admin/order-list";

export const metadata: Metadata = {
  title: "Orders — Riser Admin",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <OrderList />;
}

