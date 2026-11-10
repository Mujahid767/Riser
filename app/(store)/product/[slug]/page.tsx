import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/product/product-detail-client";
import { getSeedProductBySlug } from "@/lib/utils/seed-products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getSeedProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} — Riser`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Riser`,
      description: product.description,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getSeedProductBySlug(slug);
  if (!product) notFound();

  return <ProductDetailClient slug={slug} />;
}
