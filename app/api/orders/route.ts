import { NextResponse } from "next/server";
import { z } from "zod";
import { loadCatalog } from "@/lib/catalog";
import { createOrderAtomic, findOrderByIdempotencyKey } from "@/lib/orders/store";
import type { OrderItem } from "@/lib/orders/types";
import type { StockRequest } from "@/lib/products/store";
import { getPriceForSize, getStockForSize, hasPerSizeStock } from "@/lib/products/types";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { calculateShipping, DISTRICTS, MAX_QTY_PER_LINE, normalizeBdPhone } from "@/lib/shipping";
import { dispatchOrderTrackingEvent } from "@/lib/analytics/order-tracking";
import {
  extractMetaIdentifiersFromCookieHeader,
  sanitizeMetaCookieId,
} from "@/lib/analytics/fb-cookies";
import { validateCoupon } from "@/lib/coupons";

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
  fbp: z.string().trim().max(300).optional(),
  fbc: z.string().trim().max(300).optional(),
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

  // 2b. Check idempotency key BEFORE stock/coupon validation so retries return
  // the original confirmation even if that order took the last unit in stock.
  const priorOrder = await findOrderByIdempotencyKey(body.idempotencyKey);
  if (priorOrder) {
    return NextResponse.json(
      {
        orderNumber: priorOrder.orderNumber,
        total: priorOrder.total,
        subtotal: priorOrder.subtotal,
        shippingFee: priorOrder.shippingFee,
        discount: priorOrder.discount,
        duplicate: true,
      },
      { status: 200 }
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
  const sizeNeeds = new Map<string, { productId: string; size: string; qty: number }>();
  const stockRequests: StockRequest[] = [];
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
    const availForLine = tracked
      ? getStockForSize(product.stock, product.sizeStock, it.size) ?? 0
      : null;
    const maxQty = availForLine === null ? null : Math.max(0, availForLine);
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
    if (tracked) {
      stockNeeds.set(product.id, (stockNeeds.get(product.id) ?? 0) + it.qty);
      stockRequests.push({ productId: product.id, size: it.size, qty: it.qty });
      if (it.size && hasPerSizeStock(product.sizeStock)) {
        const sk = `${product.id}__${it.size}`;
        const prev = sizeNeeds.get(sk);
        sizeNeeds.set(sk, {
          productId: product.id,
          size: it.size,
          qty: (prev?.qty ?? 0) + it.qty,
        });
      }
    }
  }

  // stock per product & per size (a product can span several color lines of the same size)
  for (const [productId, need] of stockNeeds) {
    const product = catalog.find((p) => p.id === productId)!;
    if ((product.stock ?? 0) < need) {
      problem = true;
      for (const c of checks) if (c.productId === productId) c.reason ??= `only ${product.stock ?? 0} left`;
    }
  }
  for (const { productId, size, qty } of sizeNeeds.values()) {
    const product = catalog.find((p) => p.id === productId)!;
    const avail = getStockForSize(product.stock, product.sizeStock, size) ?? 0;
    if (avail < qty) {
      problem = true;
      for (const c of checks) {
        if (c.productId === productId && c.size === size) {
          c.maxQty = avail;
          c.available = avail > 0;
          c.reason ??= avail === 0 ? `size ${size} is out of stock` : `only ${avail} left in size ${size}`;
        }
      }
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

  // 5. Atomically check idempotency, reserve per-size stock, redeem coupon,
  // allocate sequential order number, and persist the order in one transaction.
  const gpcOrDnt =
    request.headers.get("sec-gpc") === "1" || request.headers.get("dnt") === "1";
  const cookieIds = gpcOrDnt
    ? {}
    : extractMetaIdentifiersFromCookieHeader(request.headers.get("cookie"));
  const fbp = gpcOrDnt
    ? undefined
    : sanitizeMetaCookieId(body.fbp) ?? cookieIds.fbp;
  const fbc = gpcOrDnt
    ? undefined
    : sanitizeMetaCookieId(body.fbc) ?? cookieIds.fbc;

  let txResult: Awaited<ReturnType<typeof createOrderAtomic>>;
  try {
    txResult = await createOrderAtomic(
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
        fbp,
        fbc,
      },
      body.idempotencyKey,
      {
        stockRequests,
        couponCode: appliedCouponCode,
      }
    );
  } catch (error) {
    console.error("[orders] failed to save order", error);
    return NextResponse.json(
      { error: "We couldn't save your order. Please try again." },
      { status: 500 }
    );
  }

  if (txResult.kind === "stock_conflict") {
    return NextResponse.json(
      {
        error: "Sorry — someone just bought the last piece. Please review your bag.",
        code: "STOCK_CHANGED",
        lines: syncLines.map((l) => {
          const chk = checks.find((c) => c.key === l.key);
          const matchesProduct = chk?.productId === txResult.productId;
          const matchesSize = !txResult.size || chk?.size === txResult.size;
          return matchesProduct && matchesSize
            ? { ...l, maxQty: txResult.available, available: txResult.available > 0 }
            : l;
        }),
      },
      { status: 409 }
    );
  }

  if (txResult.kind === "coupon_invalid") {
    return NextResponse.json(
      { error: txResult.error, code: "COUPON_INVALID" },
      { status: 400 }
    );
  }

  const created = txResult.kind === "created";
  const order = txResult.order;

  // Once the order is safely saved, CAPI tracking errors must NEVER roll back stock or fail checkout.
  if (created) {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://riser.com.bd";
      const userAgent = request.headers.get("user-agent") || undefined;
      const ip = clientIp(request);

      await dispatchOrderTrackingEvent(order, "CODOrderPlaced", {
        eventSourceUrl: `${siteUrl}/checkout`,
        clientIp: ip,
        clientUserAgent: userAgent,
      });
    } catch (error) {
      console.error(
        `[orders] post-order tracking failed for ${order.orderNumber} (order preserved)`,
        error
      );
    }
  }

  return NextResponse.json(
    {
      orderNumber: order.orderNumber,
      total: order.total,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      duplicate: !created,
    },
    { status: created ? 201 : 200 }
  );
}
