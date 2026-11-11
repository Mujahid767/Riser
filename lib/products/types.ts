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

export const KIDS_SIZES = ["0-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-10Y", "10-12Y"];
export const WOMEN_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

