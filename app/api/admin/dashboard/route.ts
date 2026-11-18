import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getOrderAccountingDashboard } from "@/lib/orders/accounting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const accounting = await getOrderAccountingDashboard({ recentLimit: 5 });

  return NextResponse.json({
    // Realized revenue (non-test orders that are DELIVERED + PAID, by settlement date)
    todayRevenue: accounting.todayRealizedRevenue,
    todayRealizedRevenue: accounting.todayRealizedRevenue,
    yesterdayRealizedRevenue: accounting.yesterdayRealizedRevenue,
    allTimeRealizedRevenue: accounting.allTimeRealizedRevenue,
    todaySettledOrders: accounting.todaySettledOrders,
    yesterdaySettledOrders: accounting.yesterdaySettledOrders,
    allTimeSettledOrders: accounting.allTimeSettledOrders,
    revenueChange: accounting.revenueChange,

    // Order placement totals (non-test non-cancelled orders by createdAt — separate from revenue)
    todayOrders: accounting.todayPlacedOrders,
    todayPlacedValue: accounting.todayPlacedValue,
    yesterdayPlacedOrders: accounting.yesterdayPlacedOrders,
    yesterdayPlacedValue: accounting.yesterdayPlacedValue,
    placedOrdersChange: accounting.placedOrdersChange,

    // Unpaid COD & awaiting settlement
    unpaidCodCount: accounting.unpaidCodCount,
    unpaidCodValue: accounting.unpaidCodValue,
    unpaidDeliveredCount: accounting.unpaidDeliveredCount,
    unpaidDeliveredValue: accounting.unpaidDeliveredValue,

    // Refunds & returns excluded from realized revenue
    refundedCount: accounting.refundedCount,
    refundedValue: accounting.refundedValue,
    fullRefundCount: accounting.fullRefundCount,
    fullRefundValue: accounting.fullRefundValue,
    partialRefundCount: accounting.partialRefundCount,
    partialRefundValue: accounting.partialRefundValue,
    returnedCount: accounting.returnedCount,
    returnedValue: accounting.returnedValue,

    // Operational counts & lists (non-test)
    pendingCount: accounting.pendingCount,
    cancelledCount: accounting.cancelledCount,
    testOrderCount: accounting.testOrderCount,
    productCount: accounting.productCount,
    recentOrders: accounting.recentOrders,
    lowStockProducts: accounting.lowStockProducts,
    accountingNote:
      "Realized revenue counts only non-test orders that are DELIVERED and PAID, attributed by settlement date. Unpaid COD, cancelled, returned, and refunded orders are excluded.",
  });
}
