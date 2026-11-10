import type { Metadata } from "next";
import ShopClient from "@/components/store/shop-client";
import { getSeedProducts } from "@/lib/utils/seed-products";

export const metadata: Metadata = {
  title: "The Archive // Haute Couture Collection — Riser",
  description:
    "Explore Riser's luxury collection: Signature Nayra Cut with Skirt, Royal Baby Frocks, Kids & Adult Two-Piece and Three-Piece Sets, and Architectural Short Tops.",
};

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    size?: string;
    color?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const allProducts = getSeedProducts();

  return (
    <div className="bg-[#070709] min-h-screen text-white select-none">
      {/* Editorial Page Header */}
      <div className="border-b border-white/10 bg-[#050507]">
        <div className="container-store py-12 sm:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-brand-500 font-bold mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-brand-500" />
                THE ATELIER DIRECTORY
              </p>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-[0.05em] font-sans">
                COMPLETE ARCHIVE
              </h1>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                {allProducts.length} SIGNATURE PIECES CATALOGED
              </p>
              <p className="text-[10px] font-mono text-neutral-500 mt-1 uppercase">
                PETITE ATELIER (0-12Y) &bull; MAISON FEMME (XS-XL)
              </p>
            </div>
          </div>
        </div>
      </div>

      <ShopClient
        initialProducts={allProducts}
        searchQuery={params.q}
        initialCategory={params.category}
      />
    </div>
  );
}
