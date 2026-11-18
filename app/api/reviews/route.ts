import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { getAdminSession } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { listAllReviews, approveReview, deleteReview } from "@/lib/reviews";
import { submitReview, getProductReviews, getProductRating } from "@/lib/reviews";

export const runtime = "nodejs";

// Public: GET /api/reviews?productId=xxx
// Admin:  GET /api/reviews   (all)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (productId) {
    const [reviews, rating] = await Promise.all([
      getProductReviews(productId),
      getProductRating(productId),
    ]);
    return NextResponse.json({ reviews, rating });
  }

  // Admin path — verify cryptographic session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const reviews = await listAllReviews();
  return NextResponse.json({ reviews });
}

const submitSchema = z.object({
  productId: z.string().trim().min(1).max(100),
  orderId: z.string().trim().max(100).optional(),
  // Honeypot field — bots filling this are rejected
  website: z.string().max(0).optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
  name: z.string().trim().min(1).max(80),
});

export async function POST(request: Request) {
  const limit = rateLimit(`review:${clientIp(request)}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many review submissions. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = submitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed." },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, status: true },
  });
  if (!product || product.status !== "ACTIVE") {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  // Only link an orderId if that order actually contains the reviewed product
  let verifiedOrderId: string | undefined;
  if (parsed.data.orderId) {
    const matchedOrder = await prisma.order.findFirst({
      where: {
        id: parsed.data.orderId,
        isTest: false,
        items: { some: { productId: product.id } },
      },
      select: { id: true },
    });
    verifiedOrderId = matchedOrder?.id;
  }

  const result = await submitReview({
    productId: product.id,
    orderId: verifiedOrderId,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    name: parsed.data.name,
  });

  return NextResponse.json(
    { id: result.id, message: "Review submitted! It will appear after approval." },
    { status: 201 }
  );
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await approveReview(id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await deleteReview(id);
  return NextResponse.json({ ok: true });
}
