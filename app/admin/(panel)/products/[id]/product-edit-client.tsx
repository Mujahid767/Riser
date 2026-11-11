"use client";

import type { AdminProduct } from "@/lib/products/types";
import ProductForm from "@/components/admin/product-form";

export default function ProductEditClient({ product }: { product: AdminProduct }) {
  return <ProductForm mode="edit" initial={product} />;
}

