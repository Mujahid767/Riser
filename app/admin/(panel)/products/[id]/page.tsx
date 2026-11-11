import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products/store";
import ProductEditClient from "./product-edit-client";

type Params = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Edit Product — Riser Admin",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({ params }: Params) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return <ProductEditClient product={product} />;
}

