/**
 * lib/orders/store.ts
 * Phase 2: PostgreSQL-backed order CRUD via Prisma.
 * Public function signatures are unchanged — all callers work without modification.
 */
import prisma from "@/lib/db";
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

async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RIS-${year}-`;

  // Find the highest existing number for this year
  const last = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  const max = last
    ? parseInt(last.orderNumber.slice(prefix.length), 10)
    : 0;

  return `${prefix}${String(max + 1).padStart(6, "0")}`;
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
  const orderNumber = await nextOrderNumber();

  const row = await prisma.order.create({
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
}

export async function updateOrder(
  id: string,
  input: Partial<Pick<AdminOrder, "status" | "paymentStatus" | "trackingNumber" | "note">>
): Promise<AdminOrder | null> {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return null;

  const now = new Date();
  const nextStatus = input.status ?? existing.status;
  const nextPaymentStatus = input.paymentStatus ?? existing.paymentStatus;

  const row = await prisma.order.update({
    where: { id },
    data: {
      ...(input.status !== undefined ? { status: input.status as never } : {}),
      ...(input.paymentStatus !== undefined
        ? { paymentStatus: input.paymentStatus as never }
        : {}),
      ...(input.trackingNumber !== undefined
        ? { trackingNumber: input.trackingNumber ?? null }
        : {}),
      ...(input.note !== undefined ? { adminNotes: input.note ?? null } : {}),
      // Preserve first phone verification time even if the order later advances to PACKED/SHIPPED
      ...(nextStatus === "CONFIRMED" && !existing.confirmedAt
        ? { confirmedAt: now }
        : {}),
      // Record transition into DELIVERED / PAID so CAPI retries preserve actual event_time
      ...(nextStatus === "DELIVERED" && existing.status !== "DELIVERED"
        ? { deliveredAt: now }
        : {}),
      ...(nextPaymentStatus === "PAID" && existing.paymentStatus !== "PAID"
        ? { paidAt: now }
        : {}),
    },
    include: { items: true, trackingEvents: { orderBy: { createdAt: "asc" } } },
  });
  return toAdminOrder(row);
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

/**
 * Create an order exactly once per idempotency key.
 * If the key was already used, the original order is returned (created = false).
 * Flags repeat orders from the same phone in the last 24h for staff review.
 */
export async function createOrderIdempotent(
  input: Omit<AdminOrder, "id" | "orderNumber" | "createdAt" | "updatedAt" | "flags">,
  idempotencyKey: string
): Promise<{ order: AdminOrder; created: boolean }> {
  // Check idempotency key first (outside transaction for speed)
  const existing = await prisma.order.findUnique({
    where: { idempotencyKey },
    include: { items: true },
  });
  if (existing) return { order: toAdminOrder(existing), created: false };

  // Check for repeat phone in last 24h
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
  const orderNumber = await nextOrderNumber();

  const row = await prisma.order.create({
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
  return { order: toAdminOrder(row), created: true };
}
