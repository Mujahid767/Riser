import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getMarketingSettingsView, saveMarketingSettings } from "@/lib/marketing/settings";
import { sendCapiEvent } from "@/lib/analytics/capi";

export const runtime = "nodejs";

// GET /api/admin/marketing — read settings (tokens masked)
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const settings = await getMarketingSettingsView();
  return NextResponse.json({ settings });
}

// PUT /api/admin/marketing — update settings
export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const str = (v: unknown, max = 250) => (typeof v === "string" ? v.slice(0, max) : undefined);

  try {
    await saveMarketingSettings({
      gtmId: str(body.gtmId),
      ga4Id: str(body.ga4Id),
      metaPixelId: str(body.metaPixelId),
      metaCapiToken: str(body.metaCapiToken, 1000),
      metaTestEventCode: str(body.metaTestEventCode),
      googleSiteVerification: str(body.googleSiteVerification),
      facebookDomainVerification: str(body.facebookDomainVerification),
      purchaseEventTrigger: body.purchaseEventTrigger === "ORDER_DELIVERED" ? "ORDER_DELIVERED" : "ORDER_PLACED",
      enableAdvancedMatching: typeof body.enableAdvancedMatching === "boolean" ? body.enableAdvancedMatching : true,
    });

    const settings = await getMarketingSettingsView();
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save marketing settings." },
      { status: 500 }
    );
  }
}

// POST /api/admin/marketing — Send Test Event to Meta Events Manager
export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://riser.com.bd";
  const testOrderId = `TEST-${Date.now().toString().slice(-6)}`;

  const result = await sendCapiEvent({
    eventName: "TestCAPIConnection",
    eventId: `test-${testOrderId}`,
    eventSourceUrl: `${siteUrl}/admin/settings/marketing`,
    userName: "Test Customer",
    userPhone: "01700000000",
    userEmail: "test@riser.com.bd",
    userCity: "Dhaka",
    customData: {
      status: "verified",
      message: "Testing Meta Conversions API from Riser Atelier Admin",
      test_order_id: testOrderId,
      value: 1250,
      currency: "BDT",
    },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Failed to reach Meta Graph API." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Test event dispatched to Meta Conversions API. Check your Meta Events Manager 'Test Events' tab.",
    testOrderId,
  });
}
