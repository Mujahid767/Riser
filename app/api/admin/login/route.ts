import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCredentials,
  createSessionToken,
  verifyAdminPassword,
} from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Rate limit: 5 login attempts per 15 minutes per IP
  const ip = clientIp(request);
  const limit = rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${limit.retryAfterSec} seconds.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  const creds = adminCredentials();
  if (!creds) {
    return NextResponse.json(
      { error: "Admin login is not configured. Set ADMIN_EMAIL, ADMIN_PASSWORD, and AUTH_SECRET." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";

  // Constant-time email check
  const emailMatch =
    email.length === creds.email.length &&
    email.split("").every((c, i) => c === creds.email[i]);

  const passwordMatch = emailMatch && (await verifyAdminPassword(password));

  if (!emailMatch || !passwordMatch) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, await createSessionToken(creds.email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
