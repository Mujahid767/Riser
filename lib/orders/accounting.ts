import prisma from "@/lib/db";

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function getDhakaDayBounds(now: Date = new Date()): {
  todayStart: Date;
  tomorrowStart: Date;
  yesterdayStart: Date;
} {
  const shifted = new Date(now.getTime() + DHAKA_OFFSET_MS);
  const todayStartMs =
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) -
    DHAKA_OFFSET_MS;
  return {
    todayStart: new Date(todayStartMs),
    tomorrowStart: new Date(todayStartMs + DAY_MS),
    yesterdayStart: new Date(todayStartMs - DAY_MS),
  };
}

function toValidDate(value?: Date | string | null): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}

/**
 * Only non-test orders that are both physically DELIVERED and financially PAID
 * count toward realized revenue. Unpaid COD, pending/failed payments, cancellations,
 * returns, and refunds (REFUNDED / PARTIALLY_REFUNDED) never count as realized revenue.
 */
export function isRealizedRevenueOrder(order: {
  isTest: boolean;
  status: string;
  paymentStatus: string;
}): boolean {
  return !order.isTest && order.status === "DELIVERED" && order.paymentStatus === "PAID";
}

/**
 * Settlement occurs when BOTH delivery and payment collection have completed.
 * Falls back to `updatedAt` only when historical rows lack explicit timestamps.
 */
export function computeOrderSettlementDate(order: {
  deliveredAt?: Date | string | null;
  paidAt?: Date | string | null;
  updatedAt: Date | string;
}): Date {
  const updated = toValidDate(order.updatedAt) ?? new Date();
  const delivered = toValidDate(order.deliveredAt) ?? updated;
  const paid = toValidDate(order.paidAt) ?? updated;
  return delivered.getTime() >= paid.getTime() ? delivered : paid;
}

export type OrderAccountingDashboard = {
  generatedAt: string;
  // Realized revenue (non-test, DELIVERED + PAID, attributed by settlement date)
  todayRealizedRevenue: number;
  yesterdayRealizedRevenue: number;
  allTimeRealizedRevenue: number;
  todaySettledOrders: number;
  yesterdaySettledOrders: number;
  allTimeSettledOrders: number;
  revenueChange: number | null;

  // Order placement totals (non-test, non-CANCELLED, attributed by createdAt — distinct from revenue)
  todayPlacedOrders: number;
  todayPlacedValue: number;
  yesterdayPlacedOrders: number;
  yesterdayPlacedValue: number;
  placedOrdersChange: number | null;

  // Unpaid COD & awaiting-settlement pipeline (excluded from realized revenue)
  unpaidCodCount: number;
  unpaidCodValue: number;
  unpaidDeliveredCount: number;
  unpaidDeliveredValue: number;

  // Refunds & returns adjustments (excluded from realized revenue)
  refundedCount: number;
  refundedValue: number;
  fullRefundCount: number;
  fullRefundValue: number;
  partialRefundCount: number;
  partialRefundValue: number;
  returnedCount: number;
  returnedValue: number;

  // Operational counts (non-test)
  pendingCount: number;
  cancelledCount: number;
  testOrderCount: number;
  productCount: number;

  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    total: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    deliveredAt: string | null;
    paidAt: string | null;
    createdAt: string;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
  }>;
};

export async function getOrderAccountingDashboard(opts?: {
  now?: Date;
  recentLimit?: number;
}): Promise<OrderAccountingDashboard> {
  const now = opts?.now ?? new Date();
  const { todayStart, tomorrowStart, yesterdayStart } = getDhakaDayBounds(now);
  const recentLimit = opts?.recentLimit ?? 6;

  const [
    realizedWindowRows,
    allTimeRealizedAgg,
    todayPlacedAgg,
    yesterdayPlacedAgg,
    unpaidCodAgg,
    unpaidDeliveredAgg,
    refundAndReturnRows,
    pendingCount,
    cancelledCount,
    testOrderCount,
    productCount,
    recentOrderRows,
    lowStockProducts,
  ] = await Promise.all([
    prisma.order.findMany({
      where: {
        isTest: false,
        status: "DELIVERED",
        paymentStatus: "PAID",
        OR: [
          { deliveredAt: { gte: yesterdayStart } },
          { paidAt: { gte: yesterdayStart } },
          { updatedAt: { gte: yesterdayStart } },
        ],
      },
      select: {
        totalAmount: true,
        deliveredAt: true,
        paidAt: true,
        updatedAt: true,
      },
    }),
    prisma.order.aggregate({
      where: { isTest: false, status: "DELIVERED", paymentStatus: "PAID" },
      _sum: { totalAmount: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: {
        isTest: false,
        status: { not: "CANCELLED" },
        createdAt: { gte: todayStart, lt: tomorrowStart },
      },
      _sum: { totalAmount: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: {
        isTest: false,
        status: { not: "CANCELLED" },
        createdAt: { gte: yesterdayStart, lt: todayStart },
      },
      _sum: { totalAmount: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: {
        isTest: false,
        status: { notIn: ["CANCELLED", "RETURNED"] },
        paymentStatus: "PENDING",
      },
      _sum: { totalAmount: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: {
        isTest: false,
        status: "DELIVERED",
        paymentStatus: "PENDING",
      },
      _sum: { totalAmount: true },
      _count: { _all: true },
    }),
    prisma.order.findMany({
      where: {
        isTest: false,
        OR: [
          { paymentStatus: { in: ["REFUNDED", "PARTIALLY_REFUNDED"] } },
          { status: "RETURNED" },
        ],
      },
      select: {
        totalAmount: true,
        status: true,
        paymentStatus: true,
      },
    }),
    prisma.order.count({ where: { isTest: false, status: "PENDING" } }),
    prisma.order.count({ where: { isTest: false, status: "CANCELLED" } }),
    prisma.order.count({ where: { isTest: true } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.findMany({
      where: { isTest: false },
      orderBy: { createdAt: "desc" },
      take: recentLimit,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        totalAmount: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        deliveredAt: true,
        paidAt: true,
        createdAt: true,
      },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", stock: { gt: 0, lte: 5 } },
      orderBy: { stock: "asc" },
      take: 5,
      select: { id: true, name: true, stock: true },
    }),
  ]);

  let todayRealizedRevenue = 0;
  let yesterdayRealizedRevenue = 0;
  let todaySettledOrders = 0;
  let yesterdaySettledOrders = 0;

  for (const row of realizedWindowRows) {
    const settledAt = computeOrderSettlementDate(row).getTime();
    const amount = Number(row.totalAmount);
    if (settledAt >= todayStart.getTime() && settledAt < tomorrowStart.getTime()) {
      todayRealizedRevenue += amount;
      todaySettledOrders += 1;
    } else if (settledAt >= yesterdayStart.getTime() && settledAt < todayStart.getTime()) {
      yesterdayRealizedRevenue += amount;
      yesterdaySettledOrders += 1;
    }
  }

  const allTimeRealizedRevenue = Number(allTimeRealizedAgg._sum.totalAmount ?? 0);
  const allTimeSettledOrders = allTimeRealizedAgg._count._all;

  const revenueChange =
    yesterdayRealizedRevenue === 0
      ? null
      : Math.round(((todayRealizedRevenue - yesterdayRealizedRevenue) / yesterdayRealizedRevenue) * 100);

  const todayPlacedOrders = todayPlacedAgg._count._all;
  const todayPlacedValue = Number(todayPlacedAgg._sum.totalAmount ?? 0);
  const yesterdayPlacedOrders = yesterdayPlacedAgg._count._all;
  const yesterdayPlacedValue = Number(yesterdayPlacedAgg._sum.totalAmount ?? 0);
  const placedOrdersChange =
    yesterdayPlacedOrders === 0
      ? null
      : Math.round(((todayPlacedOrders - yesterdayPlacedOrders) / yesterdayPlacedOrders) * 100);

  let fullRefundCount = 0;
  let fullRefundValue = 0;
  let partialRefundCount = 0;
  let partialRefundValue = 0;
  let returnedCount = 0;
  let returnedValue = 0;

  for (const row of refundAndReturnRows) {
    const amount = Number(row.totalAmount);
    if (row.paymentStatus === "REFUNDED") {
      fullRefundCount += 1;
      fullRefundValue += amount;
    } else if (row.paymentStatus === "PARTIALLY_REFUNDED") {
      partialRefundCount += 1;
      partialRefundValue += amount;
    }
    if (row.status === "RETURNED") {
      returnedCount += 1;
      returnedValue += amount;
    }
  }

  return {
    generatedAt: now.toISOString(),
    todayRealizedRevenue,
    yesterdayRealizedRevenue,
    allTimeRealizedRevenue,
    todaySettledOrders,
    yesterdaySettledOrders,
    allTimeSettledOrders,
    revenueChange,
    todayPlacedOrders,
    todayPlacedValue,
    yesterdayPlacedOrders,
    yesterdayPlacedValue,
    placedOrdersChange,
    unpaidCodCount: unpaidCodAgg._count._all,
    unpaidCodValue: Number(unpaidCodAgg._sum.totalAmount ?? 0),
    unpaidDeliveredCount: unpaidDeliveredAgg._count._all,
    unpaidDeliveredValue: Number(unpaidDeliveredAgg._sum.totalAmount ?? 0),
    refundedCount: fullRefundCount + partialRefundCount,
    refundedValue: fullRefundValue + partialRefundValue,
    fullRefundCount,
    fullRefundValue,
    partialRefundCount,
    partialRefundValue,
    returnedCount,
    returnedValue,
    pendingCount,
    cancelledCount,
    testOrderCount,
    productCount,
    recentOrders: recentOrderRows.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      total: Number(o.totalAmount),
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      deliveredAt: o.deliveredAt ? o.deliveredAt.toISOString() : null,
      paidAt: o.paidAt ? o.paidAt.toISOString() : null,
      createdAt: o.createdAt.toISOString(),
    })),
    lowStockProducts,
  };
}
