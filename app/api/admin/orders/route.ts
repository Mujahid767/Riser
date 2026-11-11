import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { listOrders, getOrder, updateOrder } from "@/lib/orders/store";
import type { OrderStatus } from "@/lib/orders/types";

export const runtime = "nodejs";

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

// PUT /api/admin/orders?id=xxx — update status/tracking
export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const body = (await request.json().catch(() => null)) as {
    status?: OrderStatus;
    paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    trackingNumber?: string;
    note?: string;
  } | null;

  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const order = await updateOrder(id, body);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  return NextResponse.json({ order });
}

