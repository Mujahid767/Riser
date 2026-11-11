import type { Metadata } from "next";
import ProductForm from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "New Product — Riser Admin",
  robots: { index: false, follow: false },
};

export default function NewProductPage() {
  return <ProductForm mode="new" />;
}

