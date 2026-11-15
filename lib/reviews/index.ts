/**
 * lib/reviews/index.ts
 * Phase 6: Product reviews — submit, list, and admin-approve.
 */

import { prisma } from "@/lib/db";

export type PublicReview = {
  id: string;
  rating: number;
  comment: string | null;
  name: string;
  createdAt: string;
};

export type AdminReview = PublicReview & {
  productId: string;
  productName?: string;
  orderId: string | null;
  approved: boolean;
};

// ─── Public ──────────────────────────────────────────────────────────────────

/** Returns approved reviews for a product, newest first. */
export async function getProductReviews(productId: string): Promise<PublicReview[]> {
  const rows = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    name: r.name,
    createdAt: r.createdAt.toISOString(),
  }));
}

/** Returns star rating stats for a product. */
export async function getProductRating(
  productId: string
): Promise<{ average: number; count: number }> {
  const agg = await prisma.review.aggregate({
    where: { productId, approved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return {
    average: agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : 0,
    count: agg._count.rating,
  };
}

/** Submit a new review (unapproved by default). */
export async function submitReview(data: {
  productId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  name: string;
}): Promise<{ id: string }> {
  const review = await prisma.review.create({
    data: {
      productId: data.productId,
      orderId: data.orderId ?? null,
      rating: Math.min(5, Math.max(1, Math.round(data.rating))),
      comment: data.comment?.trim() || null,
      name: data.name.trim(),
      approved: false,
    },
  });
  return { id: review.id };
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function listAllReviews(): Promise<AdminReview[]> {
  const rows = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    name: r.name,
    productId: r.productId,
    productName: r.product?.name,
    orderId: r.orderId,
    approved: r.approved,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function approveReview(id: string): Promise<void> {
  await prisma.review.update({ where: { id }, data: { approved: true } });
}

export async function deleteReview(id: string): Promise<void> {
  await prisma.review.delete({ where: { id } });
}
