import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/product/product-detail-client";
import { getCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function findProduct(slug: string) {
  const all = await getCatalogProducts();
  return { all, product: all.find((p) => p.slug === slug) };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await findProduct(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} — Riser`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Riser`,
      description: product.description,
      type: "website",
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { all, product } = await findProduct(slug);
  if (!product) notFound();

  const related = all
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  return <ProductDetailClient product={product} related={related} />;
}
