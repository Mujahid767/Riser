import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orders/store";
import OrderDetailClient from "@/components/admin/order-detail";

type Params = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Order — Riser Admin",
  robots: { index: false, follow: false },
};

export default async function OrderDetailPage({ params }: Params) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  return <OrderDetailClient order={order} />;
}

