import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { normalizeBdPhone } from "@/lib/shipping";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawOrderNumber = searchParams.get("orderNumber")?.trim() ?? "";
  const rawPhone = searchParams.get("phone")?.trim() ?? "";

  if (!rawOrderNumber || !rawPhone) {
    return NextResponse.json(
      { error: "Order number and phone are required." },
      { status: 400 }
    );
  }

  const phone = normalizeBdPhone(rawPhone);
  if (!phone) {
    return NextResponse.json(
      { error: "Enter a valid Bangladeshi mobile number." },
      { status: 400 }
    );
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: { equals: rawOrderNumber.toUpperCase() },
      customerPhone: phone,
    },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customerName,
    createdAt: order.createdAt.toISOString(),
    district: order.district,
    trackingNumber: order.trackingNumber ?? undefined,
    total: Number(order.totalAmount),
    shippingFee: Number(order.shippingAmount),
    items: order.items.map((i) => ({
      productName: i.productName,
      size: i.size ?? undefined,
      color: i.color ?? undefined,
      qty: i.quantity,
      unitPrice: Number(i.unitPrice),
    })),
  });
}
