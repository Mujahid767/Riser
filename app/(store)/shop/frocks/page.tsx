import type { Metadata } from "next";
import ShopClient from "@/components/store/shop-client";
import { getSeedProductsByCategory } from "@/lib/utils/seed-products";

export const metadata: Metadata = {
  title: "frocks — Riser",
};

export default function CategoryPage() {
  const products = getSeedProductsByCategory("frocks");
  return (
    <div className="bg-[#070709] min-h-screen text-white select-none">
      <div className="bg-[#050507] border-b border-white/10">
        <div className="container-store py-8 sm:py-12">
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-brand-500 font-bold mb-2">
            PETITE ATELIER
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-wider font-sans">
            BABY FROCKS
          </h1>
          <p className="mt-2 text-neutral-400 font-mono text-xs uppercase tracking-widest">
            {products.length} HEIRLOOM PIECES AVAILABLE
          </p>
        </div>
      </div>
      <ShopClient initialProducts={products} initialCategory="baby-frock" />
    </div>
  );
}
