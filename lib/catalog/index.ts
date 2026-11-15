import { cache } from "react";
import prisma from "@/lib/db";
import type { AdminProduct, ProductColor } from "@/lib/products/types";
import { SEED_PRODUCTS, type SeedProduct } from "@/lib/utils/seed-products";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * The ONE place the storefront and the order API get products from.
 * Phase 2: reads directly from PostgreSQL via Prisma.
 */
export type StoreProduct = SeedProduct & {
  /** "admin" = real product (stock tracked). "seed" = demo product (dev only). */
  source: "admin" | "seed";
};

function dec(d: Decimal | null | undefined): number {
  if (d == null) return 0;
  return Number(d.toString());
}

function fromDb(row: {
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
  sizePrices?: unknown;
  editionBadge: string | null;
  isNew: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
  isLimited: boolean;
  tags: string[];
  stock: number;
}): StoreProduct {
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
  const gallery = Array.isArray(row.galleryImages)
    ? (row.galleryImages as string[])
    : [];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: dec(row.basePrice),
    compareAtPrice: row.compareAtPrice ? dec(row.compareAtPrice) : undefined,
    imageUrl: row.imageUrl,
    secondaryImageUrl: row.secondaryImageUrl ?? undefined,
    gallery,
    stock: Math.max(0, row.stock),
    isNew: row.isNew,
    isBestSeller: row.isBestSeller,
    isOnSale: row.isOnSale,
    isLimited: row.isLimited,
    editionBadge: row.editionBadge ?? undefined,
    colors,
    sizes,
    sizePrices,
    category: (row.category ?? "baby-frock") as AdminProduct["category"],
    department: (row.department ?? "petite") as AdminProduct["department"],
    description: row.description ?? "",
    fabric: row.fabric ?? "",
    tags: row.tags,
    source: "admin",
  };
}

/** Uncached read — use this in API routes where freshness matters. */
export async function loadCatalog(): Promise<StoreProduct[]> {
  const rows = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      NOT: { imageUrl: "" },
    },
    orderBy: { createdAt: "desc" },
  });

  const admin = rows.map(fromDb);

  if (admin.length > 0) return admin;

  // Demo catalogue only outside production
  if (process.env.NODE_ENV !== "production") {
    return SEED_PRODUCTS.map((p) => ({ ...p, source: "seed" as const }));
  }
  return [];
}

/** Per-request cached read for server components. */
export const getCatalogProducts = cache(loadCatalog);

export async function getCatalogProductBySlug(slug: string) {
  return (await getCatalogProducts()).find((p) => p.slug === slug);
}

export function filterByCategory(
  list: StoreProduct[],
  category: string
): StoreProduct[] {
  switch (category) {
    case "new-arrivals":
      return list.filter((p) => p.isNew);
    case "best-sellers":
      return list.filter((p) => p.isBestSeller);
    case "petite":
      return list.filter((p) => p.department === "petite");
    case "women":
      return list.filter((p) => p.department === "women");
    case "frocks":
      return list.filter((p) => p.category === "baby-frock");
    case "tops":
      return list.filter((p) => p.category === "short-tops");
    case "dresses":
      return list.filter(
        (p) =>
          p.category === "nayra-dress-skirt" || p.category === "adult-one-piece"
      );
    case "party-wear":
      return list.filter(
        (p) =>
          p.category === "adult-three-piece" ||
          p.category === "three-piece-kids"
      );
    case "cotton":
      return list.filter(
        (p) =>
          p.category === "two-piece-kids" || p.category === "adult-two-piece"
      );
    default:
      return list.filter((p) => p.category === category);
  }
}

export async function getCatalogByCategory(category: string) {
  return filterByCategory(await getCatalogProducts(), category);
}
