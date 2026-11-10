import type { Metadata } from "next";
import ShopClient from "@/components/store/shop-client";
import { getSeedProductsByCategory } from "@/lib/utils/seed-products";

export const metadata: Metadata = {
  title: "Girls Dresses",
  description: "Browse Riser's collection of premium girls' dresses for ages 1–12 years.",
};

export default function DressesPage() {
  const products = getSeedProductsByCategory("dresses");
  return (
    <div>
      <div className="bg-neutral-50 border-b border-neutral-100">
        <div className="container-store py-8 sm:py-12">
          <h1 className="section-title">Girls' Dresses</h1>
          <p className="mt-2 text-neutral-500 text-sm">{products.length} products available</p>
        </div>
      </div>
      <ShopClient initialProducts={products} />
    </div>
  );
}
