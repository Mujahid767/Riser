import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getSteadfastCredentials, getSteadfastSettingsView, saveSteadfastSettings } from "@/lib/courier/settings";
import { getSteadfastBalance } from "@/lib/courier/steadfast";

export const runtime = "nodejs";

// GET — masked settings only (secrets never leave the server)
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  return NextResponse.json({ settings: await getSteadfastSettingsView() });
}

// PUT — save settings. Blank secret fields keep the stored value.
export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    apiKey?: string;
    secretKey?: string;
    enabled?: boolean;
  } | null;
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);
  const email = str(body.email, 200);
  if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid Steadfast email address." }, { status: 400 });
  }

  try {
    await saveSteadfastSettings({
      email,
      password: str(body.password, 200),
      apiKey: str(body.apiKey, 200),
      secretKey: str(body.secretKey, 200),
      enabled: typeof body.enabled === "boolean" ? body.enabled : undefined,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not save settings." }, { status: 500 });
  }
  return NextResponse.json({ settings: await getSteadfastSettingsView() });
}

// POST — "Test connection": checks the saved keys against Steadfast and returns the balance
export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const creds = await getSteadfastCredentials();
  if (!creds) {
    return NextResponse.json({ error: "Save your API key and secret key first." }, { status: 400 });
  }
  const result = await getSteadfastBalance(creds);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
  return NextResponse.json({ ok: true, balance: result.data.balance });
}
