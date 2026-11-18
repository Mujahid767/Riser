/**
 * lib/orders/store.ts
 * Phase 2: PostgreSQL-backed order CRUD via Prisma.
 * Public function signatures are unchanged — all callers work without modification.
 */
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { redeemCouponTx } from "@/lib/coupons";
import {
  releaseStockTx,
  reserveStockTx,
  type StockRequest,
} from "@/lib/products/store";
import type { AdminOrder, OrderItem, OrderStatus, OrderTrackingEvent } from "./types";
import { Decimal } from "@prisma/client/runtime/library";

// ─── Helpers ────────────────────────────────────────────────────────────────

function dec(d: Decimal): number {
  return Number(d.toString());
}

type DbOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string;
  district: string;
  subtotal: Decimal;
  shippingAmount: Decimal;
  discountAmount: Decimal;
  totalAmount: Decimal;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  customerNotes: string | null;
  adminNotes: string | null;
  trackingNumber: string | null;
  courierProvider: string | null;
  courierConsignmentId: string | null;
  courierTrackingCode: string | null;
  courierStatus: string | null;
  courierSentAt: Date | null;
  idempotencyKey: string | null;
  flags: unknown;
  fbp: string | null;
  fbc: string | null;
  confirmedAt: Date | null;
  deliveredAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    productId: string | null;
    productName: string;
    imageUrl: string | null;
    size: string | null;
    color: string | null;
    quantity: number;
    unitPrice: Decimal;
  }[];
  trackingEvents?: {
    id: string;
    orderId: string;
    orderNumber: string;
    eventName: string;
    eventId: string;
    status: string;
    attempts: number;
    lastError: string | null;
    lastAttemptAt: Date | null;
    nextRetryAt: Date | null;
    eventTime: number | null;
    sentAt: Date | null;
    createdAt: Date;
  }[];
};

function toAdminOrder(row: DbOrder): AdminOrder {
  const flags = Array.isArray(row.flags) ? (row.flags as string[]) : [];
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    customerEmail: row.customerEmail ?? undefined,
    address: row.address,
    district: row.district,
    items: row.items.map((i) => ({
      productId: i.productId ?? "",
      productName: i.productName,
      imageUrl: i.imageUrl ?? "",
      size: i.size ?? "",
      color: i.color ?? "",
      qty: i.quantity,
      unitPrice: dec(i.unitPrice),
    })) satisfies OrderItem[],
    subtotal: dec(row.subtotal),
    shippingFee: dec(row.shippingAmount),
    discount: dec(row.discountAmount),
    total: dec(row.totalAmount),
    paymentMethod: row.paymentMethod as AdminOrder["paymentMethod"],
    paymentStatus: row.paymentStatus as AdminOrder["paymentStatus"],
    status: row.status as AdminOrder["status"],
    note: row.adminNotes ?? undefined,
    customerNote: row.customerNotes ?? undefined,
    trackingNumber: row.trackingNumber ?? undefined,
    courier:
      row.courierProvider && row.courierConsignmentId
        ? {
            provider: row.courierProvider,
            consignmentId: row.courierConsignmentId,
            trackingCode: row.courierTrackingCode ?? "",
            status: row.courierStatus ?? "",
            sentAt: (row.courierSentAt ?? row.updatedAt).toISOString(),
          }
        : undefined,
    idempotencyKey: row.idempotencyKey ?? undefined,
    flags,
    fbp: row.fbp ?? undefined,
    fbc: row.fbc ?? undefined,
    confirmedAt: row.confirmedAt?.toISOString(),
    deliveredAt: row.deliveredAt?.toISOString(),
    paidAt: row.paidAt?.toISOString(),
    trackingEvents: row.trackingEvents?.map((te) => ({
      id: te.id,
      orderId: te.orderId,
      orderNumber: te.orderNumber,
      eventName: te.eventName as OrderTrackingEvent["eventName"],
      eventId: te.eventId,
      status: te.status as OrderTrackingEvent["status"],
      attempts: te.attempts,
      lastError: te.lastError ?? undefined,
      lastAttemptAt: te.lastAttemptAt?.toISOString(),
      nextRetryAt: te.nextRetryAt?.toISOString(),
      eventTime: te.eventTime ?? undefined,
      sentAt: te.sentAt?.toISOString(),
      createdAt: te.createdAt.toISOString(),
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Atomically allocate the next sequential order number for the current year
 * inside an active transaction so concurrent checkouts never collide.
 */
async function nextOrderNumberTx(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RIS-${year}-`;
  const likePattern = `${prefix}%`;

  const rows = await tx.$queryRaw<Array<{ last_value: number }>>`
    INSERT INTO order_counters (year, "lastValue")
    VALUES (
      ${year},
      COALESCE((
        SELECT MAX(CAST(SUBSTRING("orderNumber" FROM '[0-9]+$') AS INTEGER))
        FROM orders
        WHERE "orderNumber" LIKE ${likePattern}
      ), 0) + 1
    )
    ON CONFLICT (year) DO UPDATE
    SET "lastValue" = GREATEST(
      order_counters."lastValue" + 1,
      COALESCE((
        SELECT MAX(CAST(SUBSTRING("orderNumber" FROM '[0-9]+$') AS INTEGER))
        FROM orders
        WHERE "orderNumber" LIKE ${likePattern}
      ), 0) + 1
    )
    RETURNING "lastValue" AS last_value
  `;

  const seq = Number(rows[0]?.last_value ?? 1);
  return `${prefix}${String(seq).padStart(6, "0")}`;
}

export async function findOrderByIdempotencyKey(
  idempotencyKey: string
): Promise<AdminOrder | null> {
  if (!idempotencyKey) return null;
  const row = await prisma.order.findUnique({
    where: { idempotencyKey },
    include: { items: true, trackingEvents: { orderBy: { createdAt: "asc" } } },
  });
  return row ? toAdminOrder(row) : null;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function listOrders(opts?: {
  status?: OrderStatus;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ orders: AdminOrder[]; total: number }> {
  const where = {
    ...(opts?.status ? { status: opts.status as never } : {}),
    ...(opts?.search
      ? {
          OR: [
            { orderNumber: { contains: opts.search, mode: "insensitive" as const } },
            { customerName: { contains: opts.search, mode: "insensitive" as const } },
            { customerPhone: { contains: opts.search } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: opts?.offset ?? 0,
      take: opts?.limit ?? 50,
      include: { items: true },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders: rows.map(toAdminOrder), total };
}

export async function getOrder(id: string): Promise<AdminOrder | null> {
  const row = await prisma.order.findUnique({
    where: { id },
    include: { items: true, trackingEvents: { orderBy: { createdAt: "asc" } } },
  });
  return row ? toAdminOrder(row) : null;
}

export async function createOrder(
  input: Omit<AdminOrder, "id" | "orderNumber" | "createdAt" | "updatedAt">
): Promise<AdminOrder> {
  return prisma.$transaction(async (tx) => {
    const orderNumber = await nextOrderNumberTx(tx);

    const row = await tx.order.create({
      data: {
        orderNumber,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail ?? null,
        address: input.address,
        district: input.district,
        subtotal: input.subtotal,
        shippingAmount: input.shippingFee,
        discountAmount: input.discount ?? 0,
        totalAmount: input.total,
        paymentMethod: input.paymentMethod as never,
        paymentStatus: input.paymentStatus as never,
        status: input.status as never,
        customerNotes: input.customerNote ?? null,
        adminNotes: input.note ?? null,
        trackingNumber: input.trackingNumber ?? null,
        idempotencyKey: input.idempotencyKey ?? null,
        fbp: input.fbp ?? null,
        fbc: input.fbc ?? null,
        flags: (input.flags ?? []) as never,
        items: {
          create: input.items.map((i) => ({
            productId: i.productId || null,
            productName: i.productName,
            imageUrl: i.imageUrl || null,
            size: i.size || null,
            color: i.color || null,
            quantity: i.qty,
            unitPrice: i.unitPrice,
            subtotal: i.unitPrice * i.qty,
          })),
        },
      },
      include: { items: true },
    });
    return toAdminOrder(row);
  });
}

export type AtomicOrderUpdateResult =
  | { kind: "not_found" }
  | { kind: "cannot_reopen" }
  | { kind: "ok"; order: AdminOrder; cancelledNow: boolean };

/**
 * Atomically update an order inside a row-locked transaction.
 * If transitioning into CANCELLED for the first time, restores reserved stock
 * in the exact same database transaction so stock is never double-returned or lost.
 */
export async function updateOrderAtomic(
  id: string,
  input: Partial<Pick<AdminOrder, "status" | "paymentStatus" | "trackingNumber" | "note">>
): Promise<AtomicOrderUpdateResult> {
  return prisma.$transaction(
    async (tx) => {
      const locked = await tx.$queryRaw<
        Array<{ id: string }>
      >`SELECT id FROM orders WHERE id = ${id} FOR UPDATE`;
      if (locked.length === 0) return { kind: "not_found" };

      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true, trackingEvents: { orderBy: { createdAt: "asc" } } },
      });
      if (!existing) return { kind: "not_found" };

      if (existing.status === "CANCELLED" && input.status && input.status !== "CANCELLED") {
        return { kind: "cannot_reopen" };
      }

      const now = new Date();
      const nextStatus = input.status ?? existing.status;
      const nextPaymentStatus = input.paymentStatus ?? existing.paymentStatus;
      const cancellingNow = existing.status !== "CANCELLED" && nextStatus === "CANCELLED";

      const updateData = {
        ...(input.status !== undefined ? { status: input.status as never } : {}),
        ...(input.paymentStatus !== undefined
          ? { paymentStatus: input.paymentStatus as never }
          : {}),
        ...(input.trackingNumber !== undefined
          ? { trackingNumber: input.trackingNumber ?? null }
          : {}),
        ...(input.note !== undefined ? { adminNotes: input.note ?? null } : {}),
        ...(nextStatus === "CONFIRMED" && !existing.confirmedAt
          ? { confirmedAt: now }
          : {}),
        ...(nextStatus === "DELIVERED" && existing.status !== "DELIVERED"
          ? { deliveredAt: now }
          : {}),
        ...(nextPaymentStatus === "PAID" && existing.paymentStatus !== "PAID"
          ? { paidAt: now }
          : {}),
      };

      if (cancellingNow) {
        const transitioned = await tx.order.updateMany({
          where: { id, status: { not: "CANCELLED" as never } },
          data: updateData,
        });
        if (transitioned.count === 1) {
          const toRelease: StockRequest[] = existing.items
            .filter((i) => Boolean(i.productId))
            .map((i) => ({
              productId: i.productId!,
              size: i.size ?? undefined,
              qty: i.quantity,
            }));
          if (toRelease.length > 0) {
            await releaseStockTx(tx, toRelease);
          }
        }
        const refreshed = await tx.order.findUniqueOrThrow({
          where: { id },
          include: { items: true, trackingEvents: { orderBy: { createdAt: "asc" } } },
        });
        return { kind: "ok", order: toAdminOrder(refreshed), cancelledNow: transitioned.count === 1 };
      }

      const row = await tx.order.update({
        where: { id },
        data: updateData,
        include: { items: true, trackingEvents: { orderBy: { createdAt: "asc" } } },
      });
      return { kind: "ok", order: toAdminOrder(row), cancelledNow: false };
    },
    { maxWait: 10_000, timeout: 20_000 }
  );
}

export async function updateOrder(
  id: string,
  input: Partial<Pick<AdminOrder, "status" | "paymentStatus" | "trackingNumber" | "note">>
): Promise<AdminOrder | null> {
  const res = await updateOrderAtomic(id, input);
  return res.kind === "ok" ? res.order : null;
}

/** Atomically mark an order as "being sent" so a double-click can't create two consignments. */
export async function claimCourierSend(id: string, provider: string): Promise<boolean> {
  const r = await prisma.order.updateMany({
    where: { id, courierProvider: null },
    data: { courierProvider: provider, courierStatus: "sending" },
  });
  return r.count === 1;
}

/** Undo claimCourierSend after a failed API call so the admin can retry. */
export async function releaseCourierClaim(id: string): Promise<void> {
  await prisma.order.updateMany({
    where: { id, courierConsignmentId: null },
    data: { courierProvider: null, courierStatus: null },
  });
}

/** Record a Steadfast consignment against an order (also fills the tracking number). */
export async function saveCourierConsignment(
  id: string,
  c: { provider: string; consignmentId: string; trackingCode: string; status: string }
): Promise<AdminOrder | null> {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return null;
  const row = await prisma.order.update({
    where: { id },
    data: {
      courierProvider: c.provider,
      courierConsignmentId: c.consignmentId,
      courierTrackingCode: c.trackingCode || null,
      courierStatus: c.status,
      courierSentAt: new Date(),
      trackingNumber: c.trackingCode || existing.trackingNumber,
    },
    include: { items: true },
  });
  return toAdminOrder(row);
}

export type AtomicCreateOrderResult =
  | { kind: "created"; order: AdminOrder }
  | { kind: "existing"; order: AdminOrder }
  | { kind: "stock_conflict"; productId: string; size?: string; available: number }
  | { kind: "coupon_invalid"; error: string };

/**
 * Atomically create a new order together with:
 * 1) idempotency check, 2) per-size stock reservation, 3) coupon usage redemption,
 * and 4) sequential order number allocation via `order_counters`.
 */
export async function createOrderAtomic(
  input: Omit<AdminOrder, "id" | "orderNumber" | "createdAt" | "updatedAt" | "flags">,
  idempotencyKey: string,
  opts?: {
    stockRequests?: StockRequest[];
    couponCode?: string;
  }
): Promise<AtomicCreateOrderResult> {
  // Perform repeat-phone check before opening the lock-holding transaction
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const repeat = await prisma.order.findFirst({
    where: {
      customerPhone: input.customerPhone,
      status: { not: "CANCELLED" as never },
      createdAt: { gt: dayAgo },
    },
    select: { id: true },
  });
  const flags = repeat ? ["repeat_phone_24h"] : [];

  try {
    return await prisma.$transaction(
      async (tx) => {
        const stockRequests = opts?.stockRequests ?? [];
        if (stockRequests.length > 0) {
          const res = await reserveStockTx(tx, stockRequests);
          if (!res.ok) {
            throw {
              _abort: {
                kind: "stock_conflict",
                productId: res.productId,
                size: res.size,
                available: res.available,
              } satisfies AtomicCreateOrderResult,
            };
          }
        }

        if (opts?.couponCode) {
          const couponRes = await redeemCouponTx(tx, opts.couponCode, input.subtotal);
          if (!couponRes.valid) {
            throw {
              _abort: {
                kind: "coupon_invalid",
                error: couponRes.error,
              } satisfies AtomicCreateOrderResult,
            };
          }
        }

        const orderNumber = await nextOrderNumberTx(tx);

        const row = await tx.order.create({
          data: {
            orderNumber,
            customerName: input.customerName,
            customerPhone: input.customerPhone,
            customerEmail: input.customerEmail ?? null,
            address: input.address,
            district: input.district,
            subtotal: input.subtotal,
            shippingAmount: input.shippingFee,
            discountAmount: input.discount ?? 0,
            totalAmount: input.total,
            paymentMethod: input.paymentMethod as never,
            paymentStatus: input.paymentStatus as never,
            status: input.status as never,
            customerNotes: input.customerNote ?? null,
            adminNotes: input.note ?? null,
            trackingNumber: input.trackingNumber ?? null,
            idempotencyKey,
            fbp: input.fbp ?? null,
            fbc: input.fbc ?? null,
            flags: flags as never,
            items: {
              create: input.items.map((i) => ({
                productId: i.productId || null,
                productName: i.productName,
                imageUrl: i.imageUrl || null,
                size: i.size || null,
                color: i.color || null,
                quantity: i.qty,
                unitPrice: i.unitPrice,
                subtotal: i.unitPrice * i.qty,
              })),
            },
          },
          include: { items: true },
        });
        return { kind: "created", order: toAdminOrder(row) };
      },
      { maxWait: 10_000, timeout: 20_000 }
    );
  } catch (err: unknown) {
    const e = err as { _abort?: AtomicCreateOrderResult; code?: string };
    if (e?._abort) return e._abort;
    if (e?.code === "P2002") {
      const winner = await findOrderByIdempotencyKey(idempotencyKey);
      if (winner) return { kind: "existing", order: winner };
    }
    throw err;
  }
}

/**
 * Create an order exactly once per idempotency key.
 * If the key was already used, the original order is returned (created = false).
 * Flags repeat orders from the same phone in the last 24h for staff review.
 */
export async function createOrderIdempotent(
  input: Omit<AdminOrder, "id" | "orderNumber" | "createdAt" | "updatedAt" | "flags">,
  idempotencyKey: string
): Promise<{ order: AdminOrder; created: boolean }> {
  const res = await createOrderAtomic(input, idempotencyKey);
  if (res.kind === "created") return { order: res.order, created: true };
  if (res.kind === "existing") return { order: res.order, created: false };
  throw new Error("Order creation aborted unexpectedly.");
}
