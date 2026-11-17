/**
 * lib/analytics/order-tracking.ts
 * Persistent, idempotent Meta CAPI event ledger in Neon PostgreSQL.
 *
 * 3-Stage COD Funnel:
 *   1. CODOrderPlaced  -> Customer submits checkout (PENDING / PENDING)
 *   2. QualifiedOrder  -> Staff confirms order by phone (status === CONFIRMED)
 *   3. Purchase        -> Courier delivers AND COD cash received (status === DELIVERED && paymentStatus === PAID)
 *
 * Guarantees:
 *   - Unique constraint (orderId, eventName) in PostgreSQL prevents duplicate events.
 *   - Every delivery attempt, Meta API response error, and retry count is persisted.
 *   - Retries retain the exact same deterministic eventId.
 */
import prisma from "@/lib/db";
import type { AdminOrder, OrderTrackingEvent, OrderTrackingEventName } from "@/lib/orders/types";
import { sendCapiEvent } from "./capi";

const EVENT_PREFIX: Record<OrderTrackingEventName, string> = {
  CODOrderPlaced: "cod",
  QualifiedOrder: "qual",
  Purchase: "pur",
};

export function buildOrderEventId(eventName: OrderTrackingEventName, orderNumber: string): string {
  return `${EVENT_PREFIX[eventName]}-${orderNumber}`;
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://riser.com.bd";
}

function buildCustomData(order: Pick<AdminOrder, "orderNumber" | "total" | "items">) {
  const numItems = order.items.reduce((sum, i) => sum + i.qty, 0);
  const contentIds = order.items.map((i) => i.productId || i.productName).filter(Boolean);
  return {
    order_id: order.orderNumber,
    value: order.total,
    currency: "BDT",
    num_items: numItems,
    ...(contentIds.length ? { content_type: "product", content_ids: contentIds } : {}),
    contents: order.items.map((i) => ({
      id: i.productId || i.productName,
      quantity: i.qty,
      item_price: i.unitPrice,
    })),
  };
}

/** Check whether an order currently satisfies the business rule for this Meta event. */
export function isOrderEligibleForEvent(
  order: Pick<AdminOrder, "status" | "paymentStatus">,
  eventName: OrderTrackingEventName
): { eligible: boolean; reason?: string } {
  if (eventName === "CODOrderPlaced") {
    return { eligible: true };
  }
  if (eventName === "QualifiedOrder") {
    if (order.status === "CANCELLED" || order.status === "RETURNED") {
      return { eligible: false, reason: `Order is ${order.status.toLowerCase()}.` };
    }
    if (order.status !== "CONFIRMED") {
      return { eligible: false, reason: "Order must be CONFIRMED to send QualifiedOrder." };
    }
    return { eligible: true };
  }
  if (eventName === "Purchase") {
    if (order.status !== "DELIVERED" || order.paymentStatus !== "PAID") {
      return {
        eligible: false,
        reason: `Purchase requires DELIVERED + PAID (currently ${order.status} / ${order.paymentStatus}).`,
      };
    }
    return { eligible: true };
  }
  return { eligible: false, reason: "Unknown event" };
}

function toView(row: {
  id: string;
  orderId: string;
  orderNumber: string;
  eventName: string;
  eventId: string;
  status: string;
  attempts: number;
  lastError: string | null;
  lastAttemptAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
}): OrderTrackingEvent {
  return {
    id: row.id,
    orderId: row.orderId,
    orderNumber: row.orderNumber,
    eventName: row.eventName as OrderTrackingEventName,
    eventId: row.eventId,
    status: row.status as OrderTrackingEvent["status"],
    attempts: row.attempts,
    lastError: row.lastError ?? undefined,
    lastAttemptAt: row.lastAttemptAt?.toISOString(),
    sentAt: row.sentAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Send a CAPI event for an order at most once, persisting attempts & failures in Neon.
 * Safe against double clicks / race conditions via PostgreSQL unique (orderId, eventName)
 * and atomic attempt claiming.
 */
export async function dispatchOrderTrackingEvent(
  order: AdminOrder,
  eventName: OrderTrackingEventName,
  context?: {
    eventSourceUrl?: string;
    clientIp?: string;
    clientUserAgent?: string;
  }
): Promise<{ ok: boolean; alreadySent?: boolean; skipped?: string; error?: string; event?: OrderTrackingEvent }> {
  const eligibility = isOrderEligibleForEvent(order, eventName);
  if (!eligibility.eligible) {
    return { ok: false, skipped: eligibility.reason };
  }

  const eventId = buildOrderEventId(eventName, order.orderNumber);
  const siteUrl = getSiteUrl();
  const eventSourceUrl =
    context?.eventSourceUrl ||
    (eventName === "CODOrderPlaced"
      ? `${siteUrl}/order-success?order=${order.orderNumber}`
      : `${siteUrl}/admin/orders/${order.id}`);

  const customData = buildCustomData(order);
  const storedPayload = {
    eventName,
    eventId,
    eventSourceUrl,
    customData,
    clientIp: context?.clientIp,
    clientUserAgent: context?.clientUserAgent,
  };

  // Ensure a single ledger row exists for (orderId, eventName)
  let record = await prisma.trackingEvent.findUnique({
    where: { orderId_eventName: { orderId: order.id, eventName } },
  });

  if (!record) {
    try {
      record = await prisma.trackingEvent.create({
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          eventName,
          eventId,
          status: "PENDING",
          attempts: 0,
          payload: storedPayload as never,
        },
      });
    } catch {
      // Unique constraint race — fetch the winning row
      record = await prisma.trackingEvent.findUnique({
        where: { orderId_eventName: { orderId: order.id, eventName } },
      });
    }
  }

  if (!record) {
    return { ok: false, error: "Could not initialize tracking ledger record." };
  }

  if (record.status === "SENT") {
    return { ok: true, alreadySent: true, event: toView(record) };
  }

  // Prevent concurrent double-dispatch within 15 seconds while PENDING
  const staleCutoff = new Date(Date.now() - 15_000);
  const claimed = await prisma.trackingEvent.updateMany({
    where: {
      id: record.id,
      status: { not: "SENT" },
      OR: [
        { status: "FAILED" },
        { attempts: 0 },
        { lastAttemptAt: null },
        { lastAttemptAt: { lt: staleCutoff } },
      ],
    },
    data: {
      attempts: { increment: 1 },
      lastAttemptAt: new Date(),
      status: "PENDING",
      payload: storedPayload as never,
    },
  });

  if (claimed.count === 0) {
    const latest = await prisma.trackingEvent.findUnique({ where: { id: record.id } });
    return {
      ok: latest?.status !== "FAILED",
      alreadySent: latest?.status === "SENT",
      event: latest ? toView(latest) : toView(record),
    };
  }

  const sendResult = await sendCapiEvent({
    eventName,
    eventId,
    eventSourceUrl,
    userPhone: order.customerPhone,
    userEmail: order.customerEmail,
    userName: order.customerName,
    userCity: order.district,
    clientIp: context?.clientIp,
    clientUserAgent: context?.clientUserAgent,
    customData,
  });

  const updated = await prisma.trackingEvent.update({
    where: { id: record.id },
    data: sendResult.ok
      ? { status: "SENT", sentAt: new Date(), lastError: null }
      : { status: "FAILED", lastError: (sendResult.error ?? "CAPI delivery failed").slice(0, 500) },
  });

  return { ok: sendResult.ok, error: sendResult.error, event: toView(updated) };
}

/** Retry a single FAILED (or stuck PENDING) tracking event by record ID, preserving its eventId. */
export async function retryTrackingEventById(id: string): Promise<{
  ok: boolean;
  error?: string;
  event?: OrderTrackingEvent;
}> {
  const row = await prisma.trackingEvent.findUnique({
    where: { id },
    include: { order: { include: { items: true } } },
  });
  if (!row) return { ok: false, error: "Tracking event not found." };
  if (row.status === "SENT") return { ok: true, event: toView(row) };

  const orderLike: AdminOrder = {
    id: row.order.id,
    orderNumber: row.order.orderNumber,
    customerName: row.order.customerName,
    customerPhone: row.order.customerPhone,
    customerEmail: row.order.customerEmail ?? undefined,
    address: row.order.address,
    district: row.order.district,
    items: row.order.items.map((i) => ({
      productId: i.productId ?? "",
      productName: i.productName,
      imageUrl: i.imageUrl ?? "",
      size: i.size ?? "",
      color: i.color ?? "",
      qty: i.quantity,
      unitPrice: Number(i.unitPrice.toString()),
    })),
    subtotal: Number(row.order.subtotal.toString()),
    shippingFee: Number(row.order.shippingAmount.toString()),
    discount: Number(row.order.discountAmount.toString()),
    total: Number(row.order.totalAmount.toString()),
    paymentMethod: row.order.paymentMethod as AdminOrder["paymentMethod"],
    paymentStatus: row.order.paymentStatus as AdminOrder["paymentStatus"],
    status: row.order.status as AdminOrder["status"],
    createdAt: row.order.createdAt.toISOString(),
    updatedAt: row.order.updatedAt.toISOString(),
  };

  const eligibility = isOrderEligibleForEvent(orderLike, row.eventName as OrderTrackingEventName);
  if (!eligibility.eligible) {
    return { ok: false, error: eligibility.reason };
  }

  const stored = (row.payload ?? {}) as {
    eventSourceUrl?: string;
    clientIp?: string;
    clientUserAgent?: string;
  };

  const res = await dispatchOrderTrackingEvent(orderLike, row.eventName as OrderTrackingEventName, {
    eventSourceUrl: stored.eventSourceUrl,
    clientIp: stored.clientIp,
    clientUserAgent: stored.clientUserAgent,
  });

  if (res.skipped) return { ok: false, error: res.skipped, event: res.event };
  return { ok: res.ok, error: res.error, event: res.event };
}

/** Retry all FAILED (or stale PENDING > 1 min) CAPI events in Neon. */
export async function retryAllFailedTrackingEvents(): Promise<{
  retried: number;
  sent: number;
  failed: number;
}> {
  const staleCutoff = new Date(Date.now() - 60_000);
  const rows = await prisma.trackingEvent.findMany({
    where: {
      OR: [{ status: "FAILED" }, { status: "PENDING", createdAt: { lt: staleCutoff } }],
    },
    orderBy: { createdAt: "asc" },
    take: 25,
    select: { id: true },
  });

  let sent = 0;
  let failed = 0;
  for (const r of rows) {
    const res = await retryTrackingEventById(r.id);
    if (res.ok) sent += 1;
    else failed += 1;
  }
  return { retried: rows.length, sent, failed };
}

/** Fetch recent CAPI tracking events for the admin marketing dashboard. */
export async function listRecentTrackingEvents(limit = 30): Promise<{
  events: OrderTrackingEvent[];
  counts: { sent: number; failed: number; pending: number };
}> {
  const [rows, sent, failed, pending] = await Promise.all([
    prisma.trackingEvent.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
    }),
    prisma.trackingEvent.count({ where: { status: "SENT" } }),
    prisma.trackingEvent.count({ where: { status: "FAILED" } }),
    prisma.trackingEvent.count({ where: { status: "PENDING" } }),
  ]);

  return {
    events: rows.map(toView),
    counts: { sent, failed, pending },
  };
}
