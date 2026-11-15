import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { listAllReviews, approveReview, deleteReview } from "@/lib/reviews";
import { submitReview, getProductReviews, getProductRating } from "@/lib/reviews";

export const runtime = "nodejs";

async function requireAdmin() {
  const jar = await cookies();
  const session = jar.get("riser_admin_session")?.value;
  if (!session) return false;
  try {
    const data = JSON.parse(Buffer.from(session, "base64").toString("utf8"));
    return data?.role === "admin";
  } catch {
    return false;
  }
}

// Public: GET /api/reviews?productId=xxx
// Admin:  GET /api/admin/reviews   (all)
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

  // Admin path — list all
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const reviews = await listAllReviews();
  return NextResponse.json({ reviews });
}

const submitSchema = z.object({
  productId: z.string().min(1).max(100),
  orderId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  name: z.string().trim().min(1).max(80),
});

export async function POST(request: Request) {
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
  const result = await submitReview(parsed.data);
  return NextResponse.json(
    { id: result.id, message: "Review submitted! It will appear after approval." },
    { status: 201 }
  );
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await approveReview(id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await deleteReview(id);
  return NextResponse.json({ ok: true });
}
