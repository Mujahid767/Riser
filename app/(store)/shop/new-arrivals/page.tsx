import type { Metadata } from "next";
import ShopClient from "@/components/store/shop-client";
import { getCatalogByCategory } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "new arrivals — Riser",
};

export const dynamic = "force-dynamic";

export default async function CategoryPage() {
  const products = await getCatalogByCategory("new-arrivals");
  return (
    <div>
      <div className="bg-neutral-50 border-b border-neutral-100">
        <div className="container-store py-8 sm:py-12">
          <h1 className="section-title">new arrivals</h1>
          <p className="mt-2 text-neutral-500 text-sm">{products.length} products</p>
        </div>
      </div>
      <ShopClient initialProducts={products} />
    </div>
  );
}
