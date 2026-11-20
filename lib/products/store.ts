/**
 * lib/products/store.ts
 * Phase 2: PostgreSQL-backed product CRUD via Prisma.
 * Public function signatures are unchanged — all callers work without modification.
 */
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  hasPerSizeStock,
  normalizeSizeStock,
  type AdminProduct,
  type ProductColor,
} from "./types";
import { normalizeImageFramingMap } from "@/lib/images/framing";
import { Decimal } from "@prisma/client/runtime/library";

// ─── Helpers ────────────────────────────────────────────────────────────────

function decimalToNumber(d: Decimal | null | undefined): number {
  if (d == null) return 0;
  return Number(d.toString());
}

function toAdminProduct(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fabric: string | null;
  category: string | null;
  department: string | null;
  basePrice: Decimal;
  compareAtPrice: Decimal | null;
  imageUrl: string;
  secondaryImageUrl: string | null;
  galleryImages: unknown;
  imageFraming?: unknown;
  colors: unknown;
  sizes: unknown;
  sizePrices?: unknown;
  sizeStock?: unknown;
  editionBadge: string | null;
  isNew: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
  isLimited: boolean;
  tags: string[];
  status: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}): AdminProduct {
  const colors = Array.isArray(row.colors)
    ? (row.colors as ProductColor[])
    : [];
  const sizes = Array.isArray(row.sizes) ? (row.sizes as string[]) : [];
  const sizePrices: Record<string, number> = {};
  if (row.sizePrices && typeof row.sizePrices === "object" && !Array.isArray(row.sizePrices)) {
    for (const [k, v] of Object.entries(row.sizePrices as Record<string, unknown>)) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) sizePrices[k] = n;
    }
  }
  const sizeStock = normalizeSizeStock(row.sizeStock);
  const gallery = Array.isArray(row.galleryImages)
    ? (row.galleryImages as string[])
    : [];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    fabric: row.fabric ?? "",
    category: (row.category ?? "baby-frock") as AdminProduct["category"],
    department: (row.department ?? "petite") as AdminProduct["department"],
    price: decimalToNumber(row.basePrice),
    compareAtPrice: row.compareAtPrice
      ? decimalToNumber(row.compareAtPrice)
      : undefined,
    imageUrl: row.imageUrl,
    secondaryImageUrl: row.secondaryImageUrl ?? undefined,
    images: gallery,
    imageFraming: normalizeImageFramingMap(row.imageFraming),
    colors,
    sizes,
    sizePrices,
    sizeStock,
    editionBadge: row.editionBadge ?? undefined,
    isNew: row.isNew,
    isBestSeller: row.isBestSeller,
    isOnSale: row.isOnSale,
    isLimited: row.isLimited,
    tags: row.tags,
    status: row.status.toLowerCase() as AdminProduct["status"],
    stock: row.stock,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n++;
    slug = `${base}-${n}`;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function listProducts(opts?: {
  category?: string;
  status?: string;
  stock?: "in" | "out" | "low";
}): Promise<AdminProduct[]> {
  const rows = await prisma.product.findMany({
    where: {
      ...(opts?.category ? { category: opts.category } : {}),
      ...(opts?.status ? { status: opts.status.toUpperCase() as never } : {}),
      ...(opts?.stock === "in" ? { stock: { gt: 0 } } : {}),
      ...(opts?.stock === "out" ? { stock: 0 } : {}),
      ...(opts?.stock === "low" ? { stock: { gt: 0, lte: 5 } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toAdminProduct);
}

export async function getProduct(id: string): Promise<AdminProduct | null> {
  const row = await prisma.product.findUnique({ where: { id } });
  return row ? toAdminProduct(row) : null;
}

function resolveSizeStockAndTotal(
  sizes: string[],
  rawSizeStock: unknown,
  fallbackTotal: number
): { sizeStock: Record<string, number>; totalStock: number } {
  const normalized = normalizeSizeStock(rawSizeStock);
  const allowed = sizes.length > 0 ? new Set(sizes) : null;
  const filtered: Record<string, number> = {};
  for (const [k, v] of Object.entries(normalized)) {
    if (!allowed || allowed.has(k)) filtered[k] = v;
  }
  if (hasPerSizeStock(filtered)) {
    const sum = Object.values(filtered).reduce((a, b) => a + b, 0);
    return { sizeStock: filtered, totalStock: sum };
  }
  return { sizeStock: {}, totalStock: Math.max(0, Math.floor(fallbackTotal)) };
}

export async function createProduct(
  input: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">
): Promise<AdminProduct> {
  const baseSlug = slugify(input.slug || input.name);
  const slug = await uniqueSlug(baseSlug);
  const { sizeStock, totalStock } = resolveSizeStockAndTotal(
    input.sizes ?? [],
    input.sizeStock,
    input.stock ?? 0
  );

  const row = await prisma.product.create({
    data: {
      name: input.name,
      slug,
      description: input.description || null,
      fabric: input.fabric || null,
      category: input.category || null,
      department: input.department || null,
      basePrice: input.price,
      compareAtPrice: input.compareAtPrice ?? null,
      imageUrl: input.imageUrl ?? "",
      secondaryImageUrl: input.secondaryImageUrl ?? null,
      galleryImages: (input.images ?? []) as never,
      imageFraming: normalizeImageFramingMap(input.imageFraming, [
        input.imageUrl,
        input.secondaryImageUrl,
        ...(input.images ?? []),
      ]) as never,
      colors: (input.colors ?? []) as never,
      sizes: (input.sizes ?? []) as never,
      sizePrices: (input.sizePrices ?? {}) as never,
      sizeStock: sizeStock as never,
      editionBadge: input.editionBadge ?? null,
      isNew: input.isNew ?? false,
      isBestSeller: input.isBestSeller ?? false,
      isOnSale: input.isOnSale ?? false,
      isLimited: input.isLimited ?? false,
      tags: input.tags ?? [],
      status: (input.status ?? "draft").toUpperCase() as never,
      stock: totalStock,
    },
  });
  return toAdminProduct(row);
}

export async function updateProduct(
  id: string,
  input: Partial<Omit<AdminProduct, "id" | "createdAt">>
): Promise<AdminProduct | null> {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return null;

  let slug = existing.slug;
  if (input.slug && input.slug !== existing.slug) {
    slug = await uniqueSlug(slugify(input.slug), id);
  } else if (input.name && input.name !== existing.name && !input.slug) {
    // Auto-update slug only if no explicit slug provided
    // We keep the old slug to avoid breaking URLs
  }

  const existingSizes = Array.isArray(existing.sizes) ? (existing.sizes as string[]) : [];
  const nextSizes = input.sizes ?? existingSizes;
  const rawSizeStock =
    input.sizeStock !== undefined ? input.sizeStock : existing.sizeStock;
  const resolvedStock =
    input.sizeStock !== undefined || input.sizes !== undefined || input.stock !== undefined
      ? resolveSizeStockAndTotal(nextSizes, rawSizeStock, input.stock ?? existing.stock)
      : null;

  const nextImageUrl = input.imageUrl !== undefined ? input.imageUrl : existing.imageUrl;
  const nextSecondaryUrl =
    input.secondaryImageUrl !== undefined ? input.secondaryImageUrl : existing.secondaryImageUrl;
  const nextGallery =
    input.images !== undefined
      ? input.images
      : Array.isArray(existing.galleryImages)
      ? (existing.galleryImages as string[])
      : [];
  const shouldUpdateFraming =
    input.imageFraming !== undefined ||
    input.imageUrl !== undefined ||
    input.secondaryImageUrl !== undefined ||
    input.images !== undefined;
  const nextFraming = shouldUpdateFraming
    ? normalizeImageFramingMap(
        input.imageFraming !== undefined ? input.imageFraming : existing.imageFraming,
        [nextImageUrl, nextSecondaryUrl, ...(nextGallery ?? [])]
      )
    : undefined;

  const row = await prisma.product.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      slug,
      ...(input.description !== undefined
        ? { description: input.description || null }
        : {}),
      ...(input.fabric !== undefined ? { fabric: input.fabric || null } : {}),
      ...(input.category !== undefined
        ? { category: input.category || null }
        : {}),
      ...(input.department !== undefined
        ? { department: input.department || null }
        : {}),
      ...(input.price !== undefined ? { basePrice: input.price } : {}),
      ...(input.compareAtPrice !== undefined
        ? { compareAtPrice: input.compareAtPrice ?? null }
        : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.secondaryImageUrl !== undefined
        ? { secondaryImageUrl: input.secondaryImageUrl ?? null }
        : {}),
      ...(input.images !== undefined
        ? { galleryImages: (input.images ?? []) as never }
        : {}),
      ...(nextFraming !== undefined ? { imageFraming: nextFraming as never } : {}),
      ...(input.colors !== undefined
        ? { colors: (input.colors ?? []) as never }
        : {}),
      ...(input.sizes !== undefined
        ? { sizes: (input.sizes ?? []) as never }
        : {}),
      ...(input.sizePrices !== undefined
        ? { sizePrices: (input.sizePrices ?? {}) as never }
        : {}),
      ...(resolvedStock !== null
        ? {
            sizeStock: resolvedStock.sizeStock as never,
            stock: resolvedStock.totalStock,
          }
        : {}),
      ...(input.editionBadge !== undefined
        ? { editionBadge: input.editionBadge ?? null }
        : {}),
      ...(input.isNew !== undefined ? { isNew: input.isNew } : {}),
      ...(input.isBestSeller !== undefined
        ? { isBestSeller: input.isBestSeller }
        : {}),
      ...(input.isOnSale !== undefined ? { isOnSale: input.isOnSale } : {}),
      ...(input.isLimited !== undefined ? { isLimited: input.isLimited } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.status !== undefined ? { status: input.status.toUpperCase() as never } : {}),
    },
  });
  return toAdminProduct(row);
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await prisma.product.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ─── Stock reservation (all-or-nothing, per-size & row-locked) ─────────────────

export type StockRequest = { productId: string; size?: string; qty: number };

export type ReserveResult =
  | { ok: true }
  | { ok: false; productId: string; size?: string; available: number };

type GroupedProductNeed = {
  totalQty: number;
  bySize: Map<string, number>;
};

function groupStockRequests(items: StockRequest[]): Map<string, GroupedProductNeed> {
  const need = new Map<string, GroupedProductNeed>();
  for (const it of items) {
    if (!it.productId || it.qty <= 0) continue;
    const entry = need.get(it.productId) ?? { totalQty: 0, bySize: new Map() };
    entry.totalQty += it.qty;
    const sizeKey = it.size?.trim();
    if (sizeKey) {
      entry.bySize.set(sizeKey, (entry.bySize.get(sizeKey) ?? 0) + it.qty);
    }
    need.set(it.productId, entry);
  }
  return need;
}

/**
 * Lock product rows in deterministic ID order and reserve both total `stock`
 * and per-size `sizeStock` inside an active Prisma transaction.
 */
export async function reserveStockTx(
  tx: Prisma.TransactionClient,
  items: StockRequest[]
): Promise<ReserveResult> {
  const need = groupStockRequests(items);
  const productIds = [...need.keys()].sort();

  for (const productId of productIds) {
    const req = need.get(productId)!;
    const rows = await tx.$queryRaw<
      Array<{ id: string; stock: number; sizeStock: unknown }>
    >`SELECT id, stock, "sizeStock" FROM products WHERE id = ${productId} FOR UPDATE`;

    const row = rows[0];
    if (!row) {
      return { ok: false, productId, available: 0 };
    }

    const sizeMap = normalizeSizeStock(row.sizeStock);
    if (hasPerSizeStock(sizeMap)) {
      for (const [size, qty] of req.bySize) {
        const availableForSize = sizeMap[size] ?? 0;
        if (availableForSize < qty) {
          return { ok: false, productId, size, available: availableForSize };
        }
      }
      if (row.stock < req.totalQty) {
        return { ok: false, productId, available: Math.max(0, row.stock) };
      }
      for (const [size, qty] of req.bySize) {
        sizeMap[size] = Math.max(0, (sizeMap[size] ?? 0) - qty);
      }
      const nextTotal = Math.max(
        0,
        Object.values(sizeMap).reduce((sum, val) => sum + val, 0)
      );
      await tx.product.update({
        where: { id: productId },
        data: { stock: nextTotal, sizeStock: sizeMap as never },
      });
    } else {
      if (row.stock < req.totalQty) {
        return { ok: false, productId, available: Math.max(0, row.stock) };
      }
      await tx.product.update({
        where: { id: productId },
        data: { stock: row.stock - req.totalQty },
      });
    }
  }

  return { ok: true };
}

/**
 * Restore reserved stock (both total `stock` and per-size `sizeStock`) inside an
 * active Prisma transaction. Safe against concurrent updates via FOR UPDATE.
 */
export async function releaseStockTx(
  tx: Prisma.TransactionClient,
  items: StockRequest[]
): Promise<void> {
  const need = groupStockRequests(items);
  const productIds = [...need.keys()].sort();

  for (const productId of productIds) {
    const req = need.get(productId)!;
    const rows = await tx.$queryRaw<
      Array<{ id: string; stock: number; sizeStock: unknown }>
    >`SELECT id, stock, "sizeStock" FROM products WHERE id = ${productId} FOR UPDATE`;

    const row = rows[0];
    if (!row) continue; // Product was removed after order placement

    const sizeMap = normalizeSizeStock(row.sizeStock);
    if (hasPerSizeStock(sizeMap) && req.bySize.size > 0) {
      for (const [size, qty] of req.bySize) {
        sizeMap[size] = Math.max(0, (sizeMap[size] ?? 0) + qty);
      }
      const nextTotal = Object.values(sizeMap).reduce((sum, val) => sum + val, 0);
      await tx.product.update({
        where: { id: productId },
        data: { stock: nextTotal, sizeStock: sizeMap as never },
      });
    } else {
      await tx.product.update({
        where: { id: productId },
        data: { stock: row.stock + req.totalQty },
      });
    }
  }
}

export async function reserveStock(
  items: StockRequest[]
): Promise<ReserveResult> {
  const need = groupStockRequests(items);
  if (need.size === 0) return { ok: true };

  try {
    return await prisma.$transaction(
      async (tx) => {
        const res = await reserveStockTx(tx, items);
        if (!res.ok) {
          throw { _stockFail: true, res };
        }
        return res;
      },
      { maxWait: 10_000, timeout: 20_000 }
    );
  } catch (err: unknown) {
    const e = err as { _stockFail?: boolean; res?: ReserveResult };
    if (e._stockFail && e.res) return e.res;
    throw err;
  }
}

/** Give stock back (order failed to save, or order was cancelled). */
export async function releaseStock(items: StockRequest[]): Promise<void> {
  await prisma.$transaction((tx) => releaseStockTx(tx, items), {
    maxWait: 10_000,
    timeout: 20_000,
  });
}
