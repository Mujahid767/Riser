import type { Metadata } from "next";
import ProductList from "@/components/admin/product-list";

export const metadata: Metadata = {
  title: "Products — Riser Admin",
  robots: { index: false, follow: false },
};

export default function ProductsPage() {
  return <ProductList />;
}

