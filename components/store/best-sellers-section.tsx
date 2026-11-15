import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProductCard from "@/components/product/product-card";
import { getCatalogProducts } from "@/lib/catalog";
import { getSiteContent } from "@/lib/cms/store";

export default async function BestSellersSection() {
  const { bestSellers } = await getSiteContent();
  const products = (await getCatalogProducts()).filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <section className="py-20 sm:py-32 bg-[#070709] border-b border-white/10 select-none">
      <div className="container-store">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-white/10 gap-4">
          <div>
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-brand-500 font-bold mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-500" />
              {bestSellers.eyebrow}
            </p>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-[0.05em] font-sans">
              {bestSellers.title}
            </h2>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.25em] uppercase text-neutral-400 hover:text-white transition-colors group"
          >
            <span>{bestSellers.linkLabel}</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* 4 Iconic Showcase Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
