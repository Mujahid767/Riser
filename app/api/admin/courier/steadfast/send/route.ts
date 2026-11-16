import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getSteadfastCredentials } from "@/lib/courier/settings";
import { createSteadfastConsignment } from "@/lib/courier/steadfast";
import { claimCourierSend, getOrder, releaseCourierClaim, saveCourierConsignment } from "@/lib/orders/store";

export const runtime = "nodejs";

// POST /api/admin/courier/steadfast/send  { orderId }
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { orderId?: string } | null;
  if (!body?.orderId) return NextResponse.json({ error: "Missing orderId." }, { status: 400 });

  const order = await getOrder(body.orderId);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  if (order.courier) {
    return NextResponse.json({ error: "This order was already sent to Steadfast.", order }, { status: 409 });
  }
  if (order.status === "CANCELLED" || order.status === "DELIVERED") {
    return NextResponse.json({ error: `A ${order.status.toLowerCase()} order can't be sent to the courier.` }, { status: 400 });
  }

  const creds = await getSteadfastCredentials();
  if (!creds) {
    return NextResponse.json(
      { error: "Steadfast isn't set up yet. Add your API key and secret key in Settings → Courier.", code: "NOT_CONFIGURED" },
      { status: 400 }
    );
  }
  if (!creds.enabled) {
    return NextResponse.json({ error: "Steadfast is switched off in Settings → Courier." }, { status: 400 });
  }

  // Guard against double-clicks creating two consignments
  if (!(await claimCourierSend(order.id, "steadfast"))) {
    return NextResponse.json({ error: "This order is already being sent to Steadfast." }, { status: 409 });
  }

  const result = await createSteadfastConsignment(creds, order);
  if (!result.ok) {
    await releaseCourierClaim(order.id);
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const updated = await saveCourierConsignment(order.id, {
    provider: "steadfast",
    consignmentId: result.data.consignmentId,
    trackingCode: result.data.trackingCode,
    status: result.data.status,
  });
  return NextResponse.json({ order: updated, consignment: result.data });
}
