export type ProductStatus = "active" | "draft" | "archived";

export type ProductColor = {
  name: string;
  value: string; // hex
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  category:
    | "baby-frock"
    | "baby-party-frock"
    | "two-piece-kids"
    | "three-piece-kids"
    | "nayra-dress-skirt"
    | "adult-one-piece"
    | "adult-two-piece"
    | "adult-three-piece"
    | "short-tops";
  department: "petite" | "women";
  status: ProductStatus;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  secondaryImageUrl?: string;
  images: string[]; // gallery
  colors: ProductColor[];
  sizes: string[];
  sizePrices?: Record<string, number>;
  sizeStock?: Record<string, number>;
  fabric: string;
  description: string;
  editionBadge?: string;
  isNew: boolean;
  isBestSeller: boolean;
  isLimited: boolean;
  isOnSale: boolean;
  tags: string[];
  stock: number;
  createdAt: string;
  updatedAt: string;
};

export const CATEGORIES: { value: AdminProduct["category"]; label: string }[] = [
  { value: "baby-frock", label: "Baby Frock" },
  { value: "baby-party-frock", label: "Baby Party Frock" },
  { value: "two-piece-kids", label: "Two-Piece (Kids)" },
  { value: "three-piece-kids", label: "Three-Piece (Kids)" },
  { value: "nayra-dress-skirt", label: "Nayra Dress with Skirt" },
  { value: "adult-one-piece", label: "Adult One-Piece" },
  { value: "adult-two-piece", label: "Adult Two-Piece" },
  { value: "adult-three-piece", label: "Adult Three-Piece" },
  { value: "short-tops", label: "Short Tops" },
];

export const DEPARTMENTS: { value: AdminProduct["department"]; label: string }[] = [
  { value: "petite", label: "Petite Atelier (Kids)" },
  { value: "women", label: "Maison Femme (Women)" },
];

export const KIDS_SIZES = ["16", "18", "20", "22", "24", "26", "28", "30", "32", "34", "36", "38", "16-20", "22-26", "28-32", "34-38", "0-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-10Y", "10-12Y"];
export const WOMEN_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "34-38", "40-44"];

/** Resolve effective unit price for a given size (falls back to base price). */
export function getPriceForSize(
  basePrice: number,
  sizePrices?: Record<string, number> | null,
  size?: string | null
): number {
  if (size && sizePrices && typeof sizePrices[size] === "number" && sizePrices[size] > 0) {
    return sizePrices[size];
  }
  return basePrice;
}

/** Normalize raw `sizeStock` JSON into a finite non-negative integer map. */
export function normalizeSizeStock(raw?: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const key = k.trim();
    const n = Number(v);
    if (key && Number.isFinite(n) && n >= 0) {
      out[key] = Math.floor(n);
    }
  }
  return out;
}

export function hasPerSizeStock(sizeStock?: Record<string, number> | null): boolean {
  return Boolean(sizeStock && Object.keys(sizeStock).length > 0);
}

/** Resolve available stock for a given size (falls back to shared product stock when sizeStock isn't configured). */
export function getStockForSize(
  totalStock: number | undefined,
  sizeStock?: Record<string, number> | null,
  size?: string | null
): number | undefined {
  if (totalStock === undefined) return undefined;
  if (!hasPerSizeStock(sizeStock)) return Math.max(0, totalStock);
  if (!size) return Math.max(0, totalStock);
  const val = sizeStock![size];
  return typeof val === "number" && Number.isFinite(val) ? Math.max(0, val) : 0;
}

