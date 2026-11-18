import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { listOrders, getOrder, updateOrderAtomic } from "@/lib/orders/store";
import { ORDER_STATUSES, type OrderStatus, type PaymentStatus } from "@/lib/orders/types";
import { dispatchOrderTrackingEvent } from "@/lib/analytics/order-tracking";

export const runtime = "nodejs";

const VALID_PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
];

// GET /api/admin/orders?id=&status=&search=&limit=&offset=
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const order = await getOrder(id);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ order });
  }

  const result = await listOrders({
    status: (searchParams.get("status") as OrderStatus) || undefined,
    search: searchParams.get("search") || undefined,
    limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 50,
    offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : 0,
  });

  return NextResponse.json(result);
}

// PUT /api/admin/orders?id=xxx — update status/tracking & trigger verified CAPI funnel events
export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const body = (await request.json().catch(() => null)) as {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    trackingNumber?: string;
    note?: string;
  } | null;

  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  if (body.status && !ORDER_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  }
  if (body.paymentStatus && !VALID_PAYMENT_STATUSES.includes(body.paymentStatus)) {
    return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
  }

  const result = await updateOrderAtomic(id, body);
  if (result.kind === "not_found") {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (result.kind === "cannot_reopen") {
    return NextResponse.json(
      { error: "A cancelled order can't be re-opened. Ask the customer to place a new order." },
      { status: 400 }
    );
  }
  const { order } = result;

  // Stage 2: Confirmed by phone → QualifiedOrder (action_source: "phone_call", no admin URL)
  // Uses confirmedAt or current CONFIRMED status so later retries remain eligible after shipping.
  if (
    (order.status === "CONFIRMED" || Boolean(order.confirmedAt)) &&
    order.status !== "CANCELLED" &&
    order.status !== "RETURNED"
  ) {
    await dispatchOrderTrackingEvent(order, "QualifiedOrder");
  }

  // Stage 3: Purchase ONLY when BOTH status === DELIVERED AND paymentStatus === PAID
  // Uses action_source: "system_generated" without admin dashboard URL or staff browser headers.
  if (order.status === "DELIVERED" && order.paymentStatus === "PAID") {
    await dispatchOrderTrackingEvent(order, "Purchase");
  }

  // Re-fetch with latest trackingEvents so the admin UI displays updated delivery state
  const refreshed = (await getOrder(id)) ?? order;
  return NextResponse.json({ order: refreshed });
}
