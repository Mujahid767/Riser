/**
 * lib/coupons/index.ts
 * Phase 6: Coupon validation and management via Prisma.
 */

import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export type CouponResult =
  | { valid: true; code: string; type: "PERCENT" | "FIXED"; value: number; discount: number }
  | { valid: false; error: string };

/**
 * Validate a coupon code against the cart subtotal.
 * Does NOT consume the coupon — call `useCoupon()` after order is created.
 */
export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponResult> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!coupon || !coupon.active) {
    return { valid: false, error: "Invalid or expired coupon code." };
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: "This coupon has expired." };
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "This coupon has reached its usage limit." };
  }

  const minOrder = coupon.minOrderAmount ? Number(coupon.minOrderAmount.toString()) : 0;
  if (subtotal < minOrder) {
    return {
      valid: false,
      error: `Minimum order amount for this coupon is ৳${minOrder.toLocaleString()}.`,
    };
  }

  const value = Number(coupon.value.toString());
  let discount = 0;
  if (coupon.type === "PERCENT") {
    const pct = Math.min(100, Math.max(0, value));
    discount = Math.min(subtotal, Math.round((subtotal * pct) / 100));
  } else {
    discount = Math.min(value, subtotal); // FIXED — can't discount more than subtotal
  }

  return {
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value,
    discount,
  };
}

/**
 * Atomically validate and consume a coupon inside an active order transaction.
 * Ensures concurrent orders never exceed `maxUses`.
 */
export async function redeemCouponTx(
  tx: Prisma.TransactionClient,
  code: string,
  subtotal: number
): Promise<CouponResult> {
  const upper = code.toUpperCase().trim();
  const coupon = await tx.coupon.findUnique({ where: { code: upper } });

  if (!coupon || !coupon.active) {
    return { valid: false, error: "Invalid or expired coupon code." };
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: "This coupon has expired." };
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "This coupon has reached its usage limit." };
  }

  const minOrder = coupon.minOrderAmount ? Number(coupon.minOrderAmount.toString()) : 0;
  if (subtotal < minOrder) {
    return {
      valid: false,
      error: `Minimum order amount for this coupon is ৳${minOrder.toLocaleString()}.`,
    };
  }

  const updatedRows = await tx.$executeRaw`
    UPDATE coupons
    SET "usedCount" = "usedCount" + 1, "updatedAt" = NOW()
    WHERE code = ${upper}
      AND active = true
      AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
      AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
  `;

  if (updatedRows === 0) {
    return { valid: false, error: "This coupon has reached its usage limit or expired." };
  }

  const value = Number(coupon.value.toString());
  const discount =
    coupon.type === "PERCENT"
      ? Math.min(subtotal, Math.round((subtotal * Math.min(100, Math.max(0, value))) / 100))
      : Math.min(value, subtotal);

  return {
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value,
    discount,
  };
}

/** Atomically increment usedCount when used outside an order transaction. */
export async function useCoupon(code: string): Promise<boolean> {
  const upper = code.toUpperCase().trim();
  const updatedRows = await prisma.$executeRaw`
    UPDATE coupons
    SET "usedCount" = "usedCount" + 1, "updatedAt" = NOW()
    WHERE code = ${upper}
      AND active = true
      AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
      AND ("maxUses" IS NULL OR "usedCount" < "maxUses")
  `;
  return updatedRows > 0;
}

// ─── Admin CRUD ─────────────────────────────────────────────────────────────

export type AdminCoupon = {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  description: string | null;
  createdAt: string;
};

function toAdminCoupon(c: {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: Decimal;
  minOrderAmount: Decimal | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  active: boolean;
  description: string | null;
  createdAt: Date;
}): AdminCoupon {
  return {
    id: c.id,
    code: c.code,
    type: c.type,
    value: Number(c.value.toString()),
    minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount.toString()) : null,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    active: c.active,
    description: c.description,
    createdAt: c.createdAt.toISOString(),
  };
}

export async function listCoupons(): Promise<AdminCoupon[]> {
  const rows = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toAdminCoupon);
}

export async function createCoupon(data: {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  expiresAt?: string | null;
  description?: string;
}): Promise<AdminCoupon> {
  if (data.type === "PERCENT" && (data.value <= 0 || data.value > 100)) {
    throw new Error("Percentage coupon value must be between 1 and 100.");
  }
  const coupon = await prisma.coupon.create({
    data: {
      code: data.code.toUpperCase().trim(),
      type: data.type,
      value: data.value,
      minOrderAmount: data.minOrderAmount ?? null,
      maxUses: data.maxUses ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      description: data.description ?? null,
    },
  });
  return toAdminCoupon(coupon);
}

export async function updateCoupon(
  id: string,
  data: Partial<{
    active: boolean;
    maxUses: number | null;
    expiresAt: string | null;
    description: string;
  }>
): Promise<AdminCoupon> {
  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(data.active !== undefined && { active: data.active }),
      ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
      ...(data.expiresAt !== undefined && {
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });
  return toAdminCoupon(coupon);
}

export async function deleteCoupon(id: string): Promise<void> {
  await prisma.coupon.delete({ where: { id } });
}
