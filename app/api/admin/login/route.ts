import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCredentials,
  createSessionToken,
  passwordsMatch,
} from "@/lib/auth/session";

export async function POST(request: Request) {
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

  if (!passwordsMatch(email, creds.email) || !passwordsMatch(password, creds.password)) {
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
