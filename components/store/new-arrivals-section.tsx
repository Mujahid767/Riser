"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProductCard from "@/components/product/product-card";
import type { StoreProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/lib/cms/types";

const TABS = [
  { label: "ALL NEW DROPS", category: "all" },
  { label: "NAYRA & SKIRT", category: "nayra-dress-skirt" },
  { label: "BABY FROCKS", category: "baby-frock" },
  { label: "BABY PARTY FROCK", category: "baby-party-frock" },
  { label: "KIDS TWO-PIECE", category: "two-piece-kids" },
  { label: "THREE-PIECE SUITS", category: "three-piece-kids" },
  { label: "TWO-PIECE CO-ORDS", category: "adult-two-piece" },
  { label: "SHORT TOPS", category: "short-tops" },
  { label: "ADULT ONE-PIECE", category: "adult-one-piece" },
];

export default function NewArrivalsSection({
  copy,
  products: allProducts,
  hiddenCategories = [],
}: {
  copy: SiteContent["newArrivals"];
  products: StoreProduct[];
  hiddenCategories?: string[];
}) {
  const [activeTab, setActiveTab] = useState("all");
  const hiddenSet = new Set(hiddenCategories);
  const visibleTabs = TABS.filter(
    (tab) =>
      tab.category === "all" ||
      (!hiddenSet.has(tab.category) && allProducts.some((p) => p.category === tab.category))
  );

  const maxProducts = 12;
  const highlighted = allProducts.filter((p) => p.isNew || p.isBestSeller);
  const fallbackPool = highlighted.length >= maxProducts
    ? highlighted
    : [...highlighted, ...allProducts.filter((p) => !p.isNew && !p.isBestSeller)];

  const filteredProducts =
    activeTab === "all"
      ? fallbackPool.slice(0, maxProducts)
      : allProducts.filter((p) => p.category === activeTab).slice(0, maxProducts);

  return (
    <section className="py-8 sm:py-12 bg-[#09090d] border-b border-white/10 select-none">
      <div className="container-store">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 pb-4 border-b border-white/10 gap-3">
          <div>
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-brand-500 font-bold mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-500" />
              {copy.eyebrow}
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-[0.05em] font-sans">
              {copy.title}
            </h2>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.25em] uppercase text-neutral-400 hover:text-white transition-colors group"
          >
            <span>{copy.linkLabel}</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
          {visibleTabs.map((tab) => (
            <button
              key={tab.category}
              onClick={() => setActiveTab(tab.category)}
              className={cn(
                "px-3.5 py-2 text-[10px] sm:text-xs font-mono tracking-[0.18em] uppercase font-bold transition-all whitespace-nowrap cursor-pointer border",
                activeTab === tab.category
                  ? "bg-white text-black border-white shadow-lg shadow-white/10"
                  : "bg-white/5 text-neutral-400 border-white/10 hover:border-white/30 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} {...product} priority={idx < 4} />
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 p-8 border border-white/10 bg-[#0c0c11] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-500 mb-1">
              {copy.bannerEyebrow}
            </p>
            <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
              {copy.bannerTitle}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              {copy.bannerBody}
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-luxury-outline shrink-0 whitespace-nowrap text-xs"
          >
            {copy.bannerCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
