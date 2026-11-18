/**
 * lib/analytics/order-tracking.ts
 * Server-side 3-stage COD Meta CAPI dispatcher with persistent Neon ledger,
 * accurate action_source & original event_time preservation, Meta 7-day
 * event-age enforcement, exponential backoff retries, and failure alerts.
 */
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getOrder } from "@/lib/orders/store";
import type {
  AdminOrder,
  OrderTrackingEvent,
  OrderTrackingEventName,
} from "@/lib/orders/types";
import { sendCapiEvent, type CapiActionSource } from "./capi";

export const MAX_CAPI_ATTEMPTS = 6;
export const META_MAX_EVENT_AGE_SECONDS = 7 * 24 * 60 * 60; // Meta rejects events > 7 days old
const RETRY_BACKOFF_MINUTES = [1, 5, 15, 60, 240, 720] as const;

type TrackingContextInput = {
  eventSourceUrl?: string;
  clientIp?: string;
  clientUserAgent?: string;
};

type StoredTrackingContext = {
  actionSource?: CapiActionSource;
  eventSourceUrl?: string;
  clientIp?: string;
  clientUserAgent?: string;
};

type TrackingRow = {
  id: string;
  orderId: string;
  orderNumber: string;
  eventName: string;
  eventId: string;
  eventTime: number | null;
  status: string;
  attempts: number;
  lastError: string | null;
  payload: unknown;
  lastAttemptAt: Date | null;
  nextRetryAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  order?: { isTest: boolean } | null;
};

export type CapiFailureSummary = {
  exhaustedCount: number;
  retryingCount: number;
  expiredCount: number;
  recentExhausted: Array<{
    id: string;
    orderId: string;
    orderNumber: string;
    eventName: OrderTrackingEventName;
    attempts: number;
    lastError: string | null;
    lastAttemptAt: string | null;
  }>;
};

export function buildOrderEventId(
  eventName: OrderTrackingEventName,
  orderNumber: string
): string {
  switch (eventName) {
    case "CODOrderPlaced":
      return `cod-${orderNumber}`;
    case "QualifiedOrder":
      return `qual-${orderNumber}`;
    case "Purchase":
      return `pur-${orderNumber}`;
  }
}

export function getActionSourceForEvent(
  eventName: OrderTrackingEventName
): CapiActionSource {
  switch (eventName) {
    case "CODOrderPlaced":
      return "website";
    case "QualifiedOrder":
      return "phone_call";
    case "Purchase":
      return "system_generated";
  }
}

export function isOrderEligibleForEvent(
  order: AdminOrder,
  eventName: OrderTrackingEventName
): boolean {
  if (order.isTest) {
    return false;
  }
  if (eventName === "CODOrderPlaced") {
    return true;
  }
  if (eventName === "QualifiedOrder") {
    return (
      (Boolean(order.confirmedAt) || order.status === "CONFIRMED") &&
      order.status !== "CANCELLED" &&
      order.status !== "RETURNED"
    );
  }
  // Purchase ONLY when physically delivered AND cash/payment settled
  return order.status === "DELIVERED" && order.paymentStatus === "PAID";
}

function toUnixSeconds(value?: string | Date | null): number | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  const ms = date.getTime();
  if (!Number.isFinite(ms)) return undefined;
  return Math.floor(ms / 1000);
}

/**
 * Derive original business occurrence time (Unix seconds) so retries never report
 * historical checkouts/confirmations/deliveries as happening right now.
 */
export function computeOrderEventTime(
  order: AdminOrder,
  eventName: OrderTrackingEventName,
  nowUnix = Math.floor(Date.now() / 1000)
): number {
  let raw: number | undefined;

  if (eventName === "CODOrderPlaced") {
    raw = toUnixSeconds(order.createdAt);
  } else if (eventName === "QualifiedOrder") {
    raw = toUnixSeconds(order.confirmedAt) ?? toUnixSeconds(order.updatedAt);
  } else {
    const deliveredSec = toUnixSeconds(order.deliveredAt);
    const paidSec = toUnixSeconds(order.paidAt);
    raw =
      deliveredSec && paidSec
        ? Math.max(deliveredSec, paidSec)
        : deliveredSec ?? paidSec ?? toUnixSeconds(order.updatedAt);
  }

  return Math.min(raw ?? nowUnix, nowUnix);
}

export function computeNextRetryAt(
  attempts: number,
  now = new Date()
): Date | null {
  if (attempts >= MAX_CAPI_ATTEMPTS) return null;
  const idx = Math.max(
    0,
    Math.min(attempts - 1, RETRY_BACKOFF_MINUTES.length - 1)
  );
  const delayMinutes = RETRY_BACKOFF_MINUTES[idx];
  return new Date(now.getTime() + delayMinutes * 60 * 1000);
}

export function isEventExpired(
  eventTime: number,
  nowUnix = Math.floor(Date.now() / 1000)
): boolean {
  return nowUnix - eventTime > META_MAX_EVENT_AGE_SECONDS;
}

function extractStoredContext(payload: unknown): StoredTrackingContext {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }
  const obj = payload as Record<string, unknown>;
  const str = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : undefined;
  return {
    eventSourceUrl: str(obj.eventSourceUrl),
    clientIp: str(obj.clientIp),
    clientUserAgent: str(obj.clientUserAgent),
  };
}

function buildPersistablePayload(
  eventName: OrderTrackingEventName,
  context: TrackingContextInput,
  stored: StoredTrackingContext
): Prisma.InputJsonValue {
  const actionSource = getActionSourceForEvent(eventName);
  if (actionSource !== "website") {
    // Phone confirmations & courier settlements never originate on /admin/... pages
    return { actionSource };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://riser.com.bd";
  const eventSourceUrl =
    context.eventSourceUrl || stored.eventSourceUrl || `${siteUrl}/checkout`;
  const clientIp = context.clientIp ?? stored.clientIp;
  const clientUserAgent = context.clientUserAgent ?? stored.clientUserAgent;

  return {
    actionSource,
    eventSourceUrl,
    ...(clientIp ? { clientIp } : {}),
    ...(clientUserAgent ? { clientUserAgent } : {}),
  };
}

function toOrderTrackingEvent(row: TrackingRow): OrderTrackingEvent {
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
    nextRetryAt: row.nextRetryAt?.toISOString(),
    eventTime: row.eventTime ?? undefined,
    sentAt: row.sentAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    ...(row.order ? { isTest: row.order.isTest } : {}),
  };
}

async function markExpired(
  id: string,
  eventTime: number,
  nowUnix: number
): Promise<OrderTrackingEvent> {
  const ageDays = Math.floor((nowUnix - eventTime) / (24 * 60 * 60));
  const row = await prisma.trackingEvent.update({
    where: { id },
    data: {
      status: "EXPIRED",
      eventTime,
      nextRetryAt: null,
      lastError: `Exceeded Meta 7-day event age limit (${ageDays}d old); skipped so historical data stays accurate.`,
    },
  });
  return toOrderTrackingEvent(row);
}

async function executeTrackingSend(
  row: TrackingRow,
  order: AdminOrder,
  eventName: OrderTrackingEventName,
  context: TrackingContextInput = {}
): Promise<{ ok: boolean; event: OrderTrackingEvent; error?: string }> {
  const now = new Date();
  const nowUnix = Math.floor(now.getTime() / 1000);
  const eventTime = row.eventTime ?? computeOrderEventTime(order, eventName, nowUnix);

  if (isEventExpired(eventTime, nowUnix)) {
    const expired = await markExpired(row.id, eventTime, nowUnix);
    return {
      ok: false,
      event: expired,
      error: expired.lastError,
    };
  }

  const stored = extractStoredContext(row.payload);
  const persistPayload = buildPersistablePayload(eventName, context, stored);
  const payloadObj = persistPayload as {
    actionSource: CapiActionSource;
    eventSourceUrl?: string;
    clientIp?: string;
    clientUserAgent?: string;
  };

  const result = await sendCapiEvent({
    eventName,
    eventId: row.eventId,
    actionSource: payloadObj.actionSource,
    eventSourceUrl: payloadObj.eventSourceUrl,
    eventTime,
    userPhone: order.customerPhone,
    userEmail: order.customerEmail,
    userName: order.customerName,
    userCity: order.district,
    fbp: order.fbp,
    fbc: order.fbc,
    clientIp: payloadObj.clientIp,
    clientUserAgent: payloadObj.clientUserAgent,
    customData: {
      currency: "BDT",
      value: order.total,
      order_id: order.orderNumber,
      num_items: order.items.reduce((sum, item) => sum + item.qty, 0),
      content_ids: order.items.map((item) => item.productId || item.productName),
      content_type: "product",
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      order_status: order.status,
    },
  });

  const nextAttempts = row.attempts + 1;
  const finishedAt = new Date();
  const nextRetryAt = result.ok
    ? null
    : computeNextRetryAt(nextAttempts, finishedAt);

  const updated = await prisma.trackingEvent.update({
    where: { id: row.id },
    data: {
      eventTime,
      payload: persistPayload,
      status: result.ok ? "SENT" : "FAILED",
      attempts: nextAttempts,
      lastAttemptAt: finishedAt,
      lastError: result.ok ? null : result.error ?? "Unknown CAPI error",
      nextRetryAt,
      sentAt: result.ok ? finishedAt : row.sentAt,
    },
  });

  const event = toOrderTrackingEvent(updated);
  return { ok: result.ok, event, error: result.ok ? undefined : updated.lastError ?? undefined };
}

/**
 * Send or return an idempotent order tracking event.
 * Never re-sends once SENT or EXPIRED; never throws into caller checkout/admin paths.
 */
export async function dispatchOrderTrackingEvent(
  order: AdminOrder,
  eventName: OrderTrackingEventName,
  context: TrackingContextInput = {}
): Promise<OrderTrackingEvent | null> {
  if (!isOrderEligibleForEvent(order, eventName)) return null;

  const eventId = buildOrderEventId(eventName, order.orderNumber);
  const defaultEventTime = computeOrderEventTime(order, eventName);
  const initialPayload = buildPersistablePayload(eventName, context, {});

  try {
    const existing = await prisma.trackingEvent.upsert({
      where: {
        orderId_eventName: { orderId: order.id, eventName },
      },
      create: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        eventName,
        eventId,
        eventTime: defaultEventTime,
        status: "PENDING",
        attempts: 0,
        lastAttemptAt: null,
        payload: initialPayload,
      },
      update: {},
    });

    if (existing.status === "SENT" || existing.status === "EXPIRED") {
      return toOrderTrackingEvent(existing);
    }

    // Atomically claim dispatch right after creation/failure so concurrent calls
    // never transmit twice and Neon vs app-server clock skew cannot skip initial sends.
    const claimNow = new Date();
    const staleCutoff = new Date(claimNow.getTime() - 60_000);
    const claimed = await prisma.trackingEvent.updateMany({
      where: {
        id: existing.id,
        status: { in: ["PENDING", "FAILED"] },
        OR: [{ lastAttemptAt: null }, { lastAttemptAt: { lte: staleCutoff } }],
      },
      data: { lastAttemptAt: claimNow },
    });
    if (claimed.count === 0) {
      return toOrderTrackingEvent(existing);
    }

    const res = await executeTrackingSend(existing, order, eventName, context);
    return res.event;
  } catch (err) {
    console.error(`[tracking] failed dispatching ${eventName} for ${order.orderNumber}`, err);
    return null;
  }
}

export async function retryTrackingEventById(
  trackingEventId: string
): Promise<{ ok: boolean; event?: OrderTrackingEvent; error?: string }> {
  const row = await prisma.trackingEvent.findUnique({ where: { id: trackingEventId } });
  if (!row) return { ok: false, error: "Tracking event not found." };
  if (row.status === "SENT") return { ok: true, event: toOrderTrackingEvent(row) };
  if (row.status === "EXPIRED") {
    return { ok: false, error: row.lastError ?? "Event exceeded Meta 7-day age limit.", event: toOrderTrackingEvent(row) };
  }

  const order = await getOrder(row.orderId);
  if (!order) return { ok: false, error: "Associated order no longer exists." };
  if (order.isTest) {
    return {
      ok: false,
      error: `Order ${order.orderNumber} is marked as a test order; future Meta CAPI sends are blocked while preserving its ledger history.`,
    };
  }

  const eventName = row.eventName as OrderTrackingEventName;
  if (!isOrderEligibleForEvent(order, eventName)) {
    return {
      ok: false,
      error: `Order ${order.orderNumber} is not currently eligible for ${eventName} (${order.status} / ${order.paymentStatus}).`,
    };
  }

  return executeTrackingSend(row, order, eventName);
}

/**
 * Process due failed/pending tracking events whose exponential backoff window has elapsed.
 * Enforces an in-process overlap guard and respects Meta's 7-day age ceiling.
 */
const WORKER_LOCK_KEY = "__riserCapiRetryWorkerRunning";

export async function processDueTrackingRetries(limit = 20): Promise<{
  checked: number;
  sent: number;
  failed: number;
  expired: number;
  skipped: number;
}> {
  const globalState = globalThis as Record<string, unknown>;
  if (globalState[WORKER_LOCK_KEY]) {
    return { checked: 0, sent: 0, failed: 0, expired: 0, skipped: 0 };
  }

  globalState[WORKER_LOCK_KEY] = true;
  let sent = 0;
  let failed = 0;
  let expired = 0;
  let skipped = 0;
  let checked = 0;

  try {
    const now = new Date();
    const stalePendingCutoff = new Date(now.getTime() - 2 * 60 * 1000);

    const dueRows = await prisma.trackingEvent.findMany({
      where: {
        order: { isTest: false },
        OR: [
          {
            status: "FAILED",
            attempts: { lt: MAX_CAPI_ATTEMPTS },
            nextRetryAt: { lte: now },
          },
          {
            status: "FAILED",
            attempts: { lt: MAX_CAPI_ATTEMPTS },
            nextRetryAt: null,
          },
          {
            status: "PENDING",
            createdAt: { lte: stalePendingCutoff },
            attempts: { lt: MAX_CAPI_ATTEMPTS },
          },
        ],
      },
      orderBy: [{ nextRetryAt: "asc" }, { createdAt: "asc" }],
      take: limit,
    });

    checked = dueRows.length;

    for (const row of dueRows) {
      // Acquire a database lease (2 min) so overlapping workers/triggers never double-send
      const claimTime = new Date();
      const leaseUntil = new Date(claimTime.getTime() + 2 * 60 * 1000);
      const claimed = await prisma.trackingEvent.updateMany({
        where: {
          id: row.id,
          status: { in: ["PENDING", "FAILED"] },
          attempts: { lt: MAX_CAPI_ATTEMPTS },
          OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: claimTime } }],
        },
        data: {
          nextRetryAt: leaseUntil,
          lastAttemptAt: claimTime,
        },
      });
      if (claimed.count === 0) {
        skipped++;
        continue;
      }

      const order = await getOrder(row.orderId);
      const eventName = row.eventName as OrderTrackingEventName;

      if (!order) {
        await prisma.trackingEvent.update({
          where: { id: row.id },
          data: { status: "EXPIRED", nextRetryAt: null, lastError: "Associated order was deleted." },
        });
        skipped++;
        continue;
      }

      if (!isOrderEligibleForEvent(order, eventName)) {
        await prisma.trackingEvent.update({
          where: { id: row.id },
          data: {
            nextRetryAt: null,
            lastError: order.isTest
              ? "Paused automatic retries: order is marked as test."
              : `Paused automatic retries: order is ${order.status} / ${order.paymentStatus}.`,
          },
        });
        skipped++;
        continue;
      }

      const res = await executeTrackingSend(row, order, eventName);
      if (res.event.status === "EXPIRED") expired++;
      else if (res.ok) sent++;
      else failed++;
    }

    return { checked, sent, failed, expired, skipped };
  } finally {
    globalState[WORKER_LOCK_KEY] = false;
  }
}

/**
 * Manual admin override to retry all eligible FAILED/PENDING tracking events
 * (including exhausted ones after the admin fixes credentials).
 */
export async function retryAllFailedTrackingEvents(limit = 50): Promise<{
  attempted: number;
  sent: number;
  stillFailed: number;
  expired: number;
}> {
  const candidates = await prisma.trackingEvent.findMany({
    where: { status: { in: ["FAILED", "PENDING"] }, order: { isTest: false } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  let sent = 0;
  let stillFailed = 0;
  let expired = 0;

  for (const row of candidates) {
    const res = await retryTrackingEventById(row.id);
    if (res.event?.status === "EXPIRED") expired++;
    else if (res.ok) sent++;
    else stillFailed++;
  }

  return { attempted: candidates.length, sent, stillFailed, expired };
}

export async function getCapiFailureSummary(): Promise<CapiFailureSummary> {
  const [exhaustedRows, retryingCount, expiredCount, exhaustedCount] = await Promise.all([
    prisma.trackingEvent.findMany({
      where: {
        order: { isTest: false },
        status: "FAILED",
        OR: [{ attempts: { gte: MAX_CAPI_ATTEMPTS } }, { nextRetryAt: null }],
      },
      orderBy: { lastAttemptAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderId: true,
        orderNumber: true,
        eventName: true,
        attempts: true,
        lastError: true,
        lastAttemptAt: true,
      },
    }),
    prisma.trackingEvent.count({
      where: {
        order: { isTest: false },
        status: "FAILED",
        attempts: { lt: MAX_CAPI_ATTEMPTS },
        nextRetryAt: { not: null },
      },
    }),
    prisma.trackingEvent.count({ where: { order: { isTest: false }, status: "EXPIRED" } }),
    prisma.trackingEvent.count({
      where: {
        order: { isTest: false },
        status: "FAILED",
        OR: [{ attempts: { gte: MAX_CAPI_ATTEMPTS } }, { nextRetryAt: null }],
      },
    }),
  ]);

  return {
    exhaustedCount,
    retryingCount,
    expiredCount,
    recentExhausted: exhaustedRows.map((r) => ({
      id: r.id,
      orderId: r.orderId,
      orderNumber: r.orderNumber,
      eventName: r.eventName as OrderTrackingEventName,
      attempts: r.attempts,
      lastError: r.lastError,
      lastAttemptAt: r.lastAttemptAt?.toISOString() ?? null,
    })),
  };
}

export async function listRecentTrackingEvents(limit = 50): Promise<{
  events: OrderTrackingEvent[];
  counts: { sent: number; failed: number; pending: number; expired: number };
  summary: CapiFailureSummary;
}> {
  const [rows, grouped, summary] = await Promise.all([
    prisma.trackingEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { order: { select: { isTest: true } } },
    }),
    prisma.trackingEvent.groupBy({
      by: ["status"],
      where: { order: { isTest: false } },
      _count: { _all: true },
    }),
    getCapiFailureSummary(),
  ]);

  const counts = { sent: 0, failed: 0, pending: 0, expired: 0 };
  for (const g of grouped) {
    if (g.status === "SENT") counts.sent = g._count._all;
    else if (g.status === "FAILED") counts.failed = g._count._all;
    else if (g.status === "PENDING") counts.pending = g._count._all;
    else if (g.status === "EXPIRED") counts.expired = g._count._all;
  }

  return {
    events: rows.map(toOrderTrackingEvent),
    counts,
    summary,
  };
}
