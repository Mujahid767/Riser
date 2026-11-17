import { NextResponse } from "next/server";
import { z } from "zod";
import { loadCatalog } from "@/lib/catalog";
import { createOrderIdempotent } from "@/lib/orders/store";
import type { OrderItem } from "@/lib/orders/types";
import { releaseStock, reserveStock } from "@/lib/products/store";
import { getPriceForSize } from "@/lib/products/types";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { calculateShipping, DISTRICTS, MAX_QTY_PER_LINE, normalizeBdPhone } from "@/lib/shipping";
import { dispatchOrderTrackingEvent } from "@/lib/analytics/order-tracking";
import { validateCoupon, useCoupon } from "@/lib/coupons";

export const runtime = "nodejs";

const bodySchema = z.object({
  idempotencyKey: z.string().min(16).max(80),
  // honeypot — real users never see or fill this
  website: z.string().max(0).optional(),
  customerName: z.string().trim().min(2, "Enter your full name").max(100),
  customerPhone: z.string().trim().max(20),
  customerEmail: z.union([z.literal(""), z.string().trim().email("Enter a valid email").max(200)]).optional(),
  district: z.enum(DISTRICTS, { error: "Select your district" }),
  area: z.string().trim().min(2, "Enter your thana / area").max(100),
  addressLine: z.string().trim().min(5, "Enter your full address").max(500),
  // Only COD until a bKash/Nagad gateway is connected — an "unpaid bKash" order would be misleading.
  paymentMethod: z.literal("COD"),
  customerNotes: z.string().trim().max(500).optional(),
  expectedTotal: z.number().int().nonnegative(),
  couponCode: z.string().trim().max(50).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(100),
        size: z.string().max(30),
        color: z.string().max(80),
        qty: z.number().int().min(1).max(MAX_QTY_PER_LINE),
      })
    )
    .min(1, "Your bag is empty")
    .max(20),
});

type LineCheck = {
  key: string;
  productId: string;
  size: string;
  color: string;
  unitPrice: number;
  /** max units the customer may order right now; null = not stock-tracked */
  maxQty: number | null;
  available: boolean;
  reason?: string;
};

const lineKey = (id: string, size: string, color: string) => `${id}__${size}__${color}`;

export async function POST(request: Request) {
  // 1. Throttle: 6 orders / 10 min / IP
  const limit = rateLimit(`order:${clientIp(request)}`, 6, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  // 2. Parse + validate shape
  const text = await request.text();
  if (text.length > 30_000) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fieldErrors[field] ??= issue.message;
    }
    return NextResponse.json(
      { error: "Please check the highlighted fields.", fieldErrors },
      { status: 400 }
    );
  }
  const body = parsed.data;

  const phone = normalizeBdPhone(body.customerPhone);
  if (!phone) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", fieldErrors: { customerPhone: "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)" } },
      { status: 400 }
    );
  }

  // 3. Merge duplicate variants so stock is checked against the real total
  const merged = new Map<string, { productId: string; size: string; color: string; qty: number }>();
  for (const it of body.items) {
    const k = lineKey(it.productId, it.size, it.color);
    const prev = merged.get(k);
    merged.set(k, { ...it, qty: Math.min(MAX_QTY_PER_LINE, (prev?.qty ?? 0) + it.qty) });
  }

  // 4. Re-validate everything against the catalogue — never trust client prices
  const catalog = await loadCatalog();
  const checks: LineCheck[] = [];
  const orderItems: OrderItem[] = [];
  const stockNeeds = new Map<string, number>();
  let problem = false;

  for (const [key, it] of merged) {
    const product = catalog.find((p) => p.id === it.productId);
    if (!product) {
      checks.push({ key, ...it, unitPrice: 0, maxQty: 0, available: false, reason: "no longer available" });
      problem = true;
      continue;
    }
    const sizeOk = !product.sizes?.length || product.sizes.includes(it.size);
    const colorOk = !product.colors?.length || product.colors.some((c) => c.name === it.color);
    if (!sizeOk || !colorOk) {
      checks.push({ key, ...it, unitPrice: product.price, maxQty: 0, available: false, reason: "this size/colour is not available" });
      problem = true;
      continue;
    }
    const unitPrice = getPriceForSize(product.price, product.sizePrices, it.size);
    const tracked = product.source === "admin";
    const maxQty = tracked ? Math.max(0, product.stock ?? 0) : null;
    checks.push({ key, ...it, unitPrice, maxQty, available: maxQty === null || maxQty > 0 });
    orderItems.push({
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl,
      size: it.size,
      color: it.color,
      qty: it.qty,
      unitPrice,
    });
    if (tracked) stockNeeds.set(product.id, (stockNeeds.get(product.id) ?? 0) + it.qty);
  }

  // stock per product (a product can span several size/colour lines)
  for (const [productId, need] of stockNeeds) {
    const product = catalog.find((p) => p.id === productId)!;
    if ((product.stock ?? 0) < need) {
      problem = true;
      for (const c of checks) if (c.productId === productId) c.reason ??= `only ${product.stock ?? 0} left`;
    }
  }

  const subtotal = orderItems.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const shippingFee = calculateShipping(body.district, subtotal);

  // 4b. Validate coupon (if provided)
  let couponDiscount = 0;
  let appliedCouponCode: string | undefined;
  if (body.couponCode) {
    const couponResult = await validateCoupon(body.couponCode, subtotal);
    if (!couponResult.valid) {
      return NextResponse.json({ error: couponResult.error, code: "COUPON_INVALID" }, { status: 400 });
    }
    couponDiscount = couponResult.discount;
    appliedCouponCode = couponResult.code;
  }

  const total = Math.max(0, subtotal + shippingFee - couponDiscount);

  const syncLines = checks.map((c) => ({
    key: c.key,
    unitPrice: c.unitPrice,
    maxQty: c.maxQty,
    available: c.available,
    reason: c.reason,
  }));

  if (problem) {
    return NextResponse.json(
      { error: "Some items in your bag changed. Please review your bag.", code: "STOCK_CHANGED", lines: syncLines },
      { status: 409 }
    );
  }
  if (total !== body.expectedTotal) {
    return NextResponse.json(
      {
        error: "Prices were updated since you added these items. Please review the new total.",
        code: "PRICE_CHANGED",
        total,
        lines: syncLines,
      },
      { status: 409 }
    );
  }

  // 5. Take stock atomically (admin products only), then save the order
  const reservations = [...stockNeeds].map(([productId, qty]) => ({ productId, qty }));
  if (reservations.length) {
    const r = await reserveStock(reservations);
    if (!r.ok) {
      return NextResponse.json(
        {
          error: "Sorry — someone just bought the last piece. Please review your bag.",
          code: "STOCK_CHANGED",
          lines: syncLines.map((l) => (checks.find((c) => c.key === l.key)?.productId === r.productId ? { ...l, maxQty: r.available, available: r.available > 0 } : l)),
        },
        { status: 409 }
      );
    }
  }

  try {
    const { order, created } = await createOrderIdempotent(
      {
        customerName: body.customerName,
        customerPhone: phone,
        customerEmail: body.customerEmail || undefined,
        address: `${body.addressLine}, ${body.area}`,
        district: body.district,
        items: orderItems,
        subtotal,
        shippingFee,
        discount: couponDiscount,
        total,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        status: "PENDING",
        customerNote: body.customerNotes || undefined,
      },
      body.idempotencyKey
    );

    // Same key arrived twice (double click / retry): hand back the original, undo the extra reservation.
    if (!created && reservations.length) await releaseStock(reservations);

    // Consume coupon on new orders only
    if (created && appliedCouponCode) {
      void useCoupon(appliedCouponCode);
    }

    // Server-side CAPI: send CODOrderPlaced ONLY when a new order is created (never Purchase on unpaid COD)
    if (created) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://riser.com.bd";
      const userAgent = request.headers.get("user-agent") || undefined;
      const ip = clientIp(request);

      await dispatchOrderTrackingEvent(order, "CODOrderPlaced", {
        eventSourceUrl: `${siteUrl}/order-success?order=${order.orderNumber}`,
        clientIp: ip,
        clientUserAgent: userAgent,
      });
    }

    return NextResponse.json(
      { orderNumber: order.orderNumber, total: order.total, subtotal: order.subtotal, shippingFee: order.shippingFee, discount: couponDiscount, duplicate: !created },
      { status: created ? 201 : 200 }
    );
  } catch (error) {
    if (reservations.length) await releaseStock(reservations);
    console.error("[orders] failed to save order", error);
    return NextResponse.json({ error: "We couldn't save your order. Please try again." }, { status: 500 });
  }
}
