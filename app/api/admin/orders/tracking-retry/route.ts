import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { retryAllFailedTrackingEvents, retryTrackingEventById } from "@/lib/analytics/order-tracking";

export const runtime = "nodejs";

// POST /api/admin/orders/tracking-retry  { id?: string, retryAll?: boolean }
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { id?: string; retryAll?: boolean } | null;
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  if (body.retryAll) {
    const summary = await retryAllFailedTrackingEvents();
    return NextResponse.json({ ok: true, ...summary });
  }

  if (!body.id) {
    return NextResponse.json({ error: "Missing tracking event id." }, { status: 400 });
  }

  const result = await retryTrackingEventById(body.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Retry failed.", event: result.event }, { status: 502 });
  }
  return NextResponse.json({ ok: true, event: result.event });
}
