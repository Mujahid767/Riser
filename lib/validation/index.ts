import { z } from "zod";

// ─── Common ───────────────────────────────────────────────────────────────────

export const phoneSchema = z
  .string()
  .min(11, "Phone number must be at least 11 digits")
  .max(14, "Phone number is too long")
  .regex(
    /^(\+?880)?01[3-9]\d{8}$/,
    "Please enter a valid Bangladeshi phone number"
  );

export const emailSchema = z.string().email("Please enter a valid email").optional();

// ─── Checkout ────────────────────────────────────────────────────────────────

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  customerPhone: phoneSchema,
  customerEmail: emailSchema,
  addressLine: z.string().min(5, "Please enter your full address").max(500),
  area: z.string().optional(),
  city: z.string().min(2, "City is required").max(100),
  district: z.string().optional(),
  division: z.string().optional(),
  postalCode: z.string().optional(),
  shippingMethodId: z.string().min(1, "Please select a delivery method"),
  paymentMethod: z.enum(["COD", "BKASH", "NAGAD", "CARD"]),
  couponCode: z.string().optional(),
  customerNotes: z.string().max(500).optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ─── Order Tracking ───────────────────────────────────────────────────────────

export const trackOrderSchema = z.object({
  orderNumber: z
    .string()
    .min(5, "Please enter a valid order number")
    .regex(/^RIS-\d{4}-\d{6}$/, "Order number format: RIS-YYYY-XXXXXX"),
  phone: phoneSchema,
});

export type TrackOrderFormData = z.infer<typeof trackOrderSchema>;

// ─── Product (Admin) ─────────────────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().optional(),
  shortDescription: z.string().max(300).optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  basePrice: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().optional(),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  isLimited: z.boolean().default(false),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ─── Product Variant (Admin) ──────────────────────────────────────────────────

export const variantSchema = z.object({
  productId: z.string(),
  sizeId: z.string().optional(),
  colorId: z.string().optional(),
  sku: z.string().max(100).optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type VariantFormData = z.infer<typeof variantSchema>;

// ─── Inventory Adjustment (Admin) ────────────────────────────────────────────

export const inventoryAdjustmentSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int(),
  type: z.enum([
    "STOCK_IN",
    "STOCK_OUT",
    "ADJUSTMENT",
    "DAMAGE",
    "RETURN",
  ]),
  notes: z.string().min(3, "Please provide a reason for this adjustment").max(500),
});

export type InventoryAdjustmentFormData = z.infer<typeof inventoryAdjustmentSchema>;

// ─── Coupon (Admin) ───────────────────────────────────────────────────────────

export const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  value: z.number().positive(),
  minimumOrderAmount: z.number().positive().optional(),
  maximumDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  usageLimitPerCustomer: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  startsAt: z.date().optional(),
  expiresAt: z.date().optional(),
});

export type CouponFormData = z.infer<typeof couponSchema>;

// ─── Review ───────────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().max(2000).optional(),
  guestName: z.string().max(100).optional(),
  guestEmail: emailSchema,
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

// ─── Admin Login ──────────────────────────────────────────────────────────────

export const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;
