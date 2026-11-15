/**
 * lib/products/store.ts
 * Phase 2: PostgreSQL-backed product CRUD via Prisma.
 * Public function signatures are unchanged — all callers work without modification.
 */
import prisma from "@/lib/db";
import type { AdminProduct, ProductColor } from "./types";
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
  colors: unknown;
  sizes: unknown;
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
    colors,
    sizes,
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

export async function createProduct(
  input: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">
): Promise<AdminProduct> {
  const baseSlug = slugify(input.slug || input.name);
  const slug = await uniqueSlug(baseSlug);

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
      colors: (input.colors ?? []) as never,
      sizes: (input.sizes ?? []) as never,
      editionBadge: input.editionBadge ?? null,
      isNew: input.isNew ?? false,
      isBestSeller: input.isBestSeller ?? false,
      isOnSale: input.isOnSale ?? false,
      isLimited: input.isLimited ?? false,
      tags: input.tags ?? [],
      status: (input.status ?? "draft").toUpperCase() as never,
      stock: input.stock ?? 0,
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
      ...(input.colors !== undefined
        ? { colors: (input.colors ?? []) as never }
        : {}),
      ...(input.sizes !== undefined
        ? { sizes: (input.sizes ?? []) as never }
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
      ...(input.stock !== undefined ? { stock: input.stock } : {}),
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

// ─── Stock reservation (all-or-nothing) ──────────────────────────────────────

export type StockRequest = { productId: string; qty: number };

export type ReserveResult =
  | { ok: true }
  | { ok: false; productId: string; available: number };

/**
 * Atomically deduct stock for every item, or deduct nothing.
 * Uses a Prisma transaction with individual UPDATE … WHERE stock >= qty checks.
 */
export async function reserveStock(
  items: StockRequest[]
): Promise<ReserveResult> {
  // Merge duplicate productIds
  const need = new Map<string, number>();
  for (const it of items)
    need.set(it.productId, (need.get(it.productId) ?? 0) + it.qty);

  try {
    await prisma.$transaction(async (tx) => {
      for (const [productId, qty] of need) {
        const updated = await tx.product.updateMany({
          where: { id: productId, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        });
        if (updated.count === 0) {
          // Not enough stock — abort the transaction
          throw { _stockFail: true, productId };
        }
      }
    });
    return { ok: true };
  } catch (err: unknown) {
    const e = err as { _stockFail?: boolean; productId?: string };
    if (e._stockFail && e.productId) {
      const row = await prisma.product.findUnique({
        where: { id: e.productId },
        select: { stock: true },
      });
      return { ok: false, productId: e.productId, available: row?.stock ?? 0 };
    }
    throw err;
  }
}

/** Give stock back (order failed to save, or order was cancelled). */
export async function releaseStock(items: StockRequest[]): Promise<void> {
  const need = new Map<string, number>();
  for (const it of items)
    need.set(it.productId, (need.get(it.productId) ?? 0) + it.qty);

  await prisma.$transaction(
    [...need].map(([productId, qty]) =>
      prisma.product.update({
        where: { id: productId },
        data: { stock: { increment: qty } },
      })
    )
  );
}
