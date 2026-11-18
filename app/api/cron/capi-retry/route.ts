import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import {
  getCapiFailureSummary,
  processDueTrackingRetries,
} from "@/lib/analytics/order-tracking";

export const runtime = "nodejs";

function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authHeader = request.headers.get("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const candidate = bearer || request.headers.get("x-cron-secret")?.trim() || "";
  if (!candidate) return false;

  const expectedBuf = Buffer.from(secret);
  const actualBuf = Buffer.from(candidate);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

async function handle(request: Request) {
  const authorizedBySecret = verifyCronSecret(request);
  const session = authorizedBySecret ? null : await getAdminSession();

  if (!authorizedBySecret && !session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [retryResult, summary] = await Promise.all([
    processDueTrackingRetries(25),
    getCapiFailureSummary(),
  ]);

  return NextResponse.json({
    ok: true,
    ...retryResult,
    exhaustedCount: summary.exhaustedCount,
    expiredCount: summary.expiredCount,
  });
}

export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}
