"use client";

import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, Grid3X3, LayoutList, X, ChevronDown } from "lucide-react";
import ProductCard from "@/components/product/product-card";
import type { SeedProduct } from "@/lib/utils/seed-products";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "all", label: "All Pieces" },
  { value: "nayra-dress-skirt", label: "Nayra & Skirt" },
  { value: "baby-frock", label: "Baby Frocks" },
  { value: "baby-party-frock", label: "Baby Party Frock" },
  { value: "two-piece-kids", label: "Kids Two-Piece" },
  { value: "three-piece-kids", label: "Kids Three-Piece" },
  { value: "adult-one-piece", label: "Adult One-Piece" },
  { value: "adult-two-piece", label: "Adult Two-Piece" },
  { value: "adult-three-piece", label: "Adult Three-Piece" },
  { value: "short-tops", label: "Short Tops" },
];

const SIZES = [
  "0-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y", "4-5Y",
  "6-7Y", "8-9Y", "10-12Y", "XS", "S", "M", "L", "XL",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Latest Drop" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Coveted" },
];

interface ShopClientProps {
  initialProducts: SeedProduct[];
  searchQuery?: string;
  initialCategory?: string;
}

export default function ShopClient({
  initialProducts,
  searchQuery,
  initialCategory,
}: ShopClientProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sortBy, setSortBy] = useState("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewGrid, setViewGrid] = useState<"2" | "3" | "4">("4");

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const filtered = useMemo(() => {
    let items = [...initialProducts];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)) ||
          p.category.includes(q)
      );
    }

    // Category
    if (selectedCategory !== "all") {
      items = items.filter((p) => p.category === selectedCategory);
    }

    // Sizes
    if (selectedSizes.length > 0) {
      items = items.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s))
      );
    }

    // Price
    items = items.filter((p) => p.price <= maxPrice);

    // Sort
    switch (sortBy) {
      case "price-asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        items.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      default:
        items.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return items;
  }, [initialProducts, searchQuery, selectedCategory, selectedSizes, maxPrice, sortBy]);

  const hasActiveFilters =
    selectedCategory !== "all" || selectedSizes.length > 0 || maxPrice < 15000;

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedSizes([]);
    setMaxPrice(15000);
  };

  const gridCols =
    viewGrid === "2"
      ? "grid-cols-2"
      : viewGrid === "3"
      ? "grid-cols-2 sm:grid-cols-3"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <div className="container-store py-8 select-none">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-white/10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={cn(
              "px-4 py-2 text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase font-bold transition-all whitespace-nowrap cursor-pointer border",
              selectedCategory === cat.value
                ? "bg-white text-black border-white"
                : "bg-white/5 text-neutral-400 border-white/10 hover:border-white/30 hover:text-white"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={cn(
              "btn-luxury-outline text-xs px-4 py-2 flex items-center gap-2",
              filterOpen && "border-white bg-white/10 text-white"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>FILTERS</span>
            {hasActiveFilters && (
              <span className="w-4 h-4 bg-brand-500 text-white text-[9px] flex items-center justify-center font-bold">
                !
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[10px] font-mono tracking-widest text-neutral-400 hover:text-white uppercase underline underline-offset-4"
            >
              RESET ALL
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Item Count */}
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            {filtered.length} {filtered.length === 1 ? "PIECE" : "PIECES"}
          </span>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0e0e12] border border-white/20 text-white text-xs font-mono tracking-wider px-3 py-2 pr-8 focus:outline-none focus:border-white cursor-pointer uppercase appearance-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0e0e12]">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Grid View Switcher */}
          <div className="hidden sm:flex items-center gap-1 border border-white/20 p-1 bg-black/40">
            <button
              onClick={() => setViewGrid("2")}
              className={cn(
                "p-1.5 transition-colors text-xs font-mono",
                viewGrid === "2" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
              )}
            >
              2
            </button>
            <button
              onClick={() => setViewGrid("3")}
              className={cn(
                "p-1.5 transition-colors text-xs font-mono",
                viewGrid === "3" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
              )}
            >
              3
            </button>
            <button
              onClick={() => setViewGrid("4")}
              className={cn(
                "p-1.5 transition-colors text-xs font-mono",
                viewGrid === "4" ? "bg-white text-black font-bold" : "text-neutral-400 hover:text-white"
              )}
            >
              4
            </button>
          </div>
        </div>
      </div>

      {/* Filter Drawer / Panel */}
      {filterOpen && (
        <div className="mb-10 p-6 bg-[#0c0c11] border border-white/15 animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sizes */}
          <div>
            <h4 className="text-[10px] font-mono tracking-[0.25em] text-white uppercase font-bold mb-3 pb-2 border-b border-white/10">
              SIZE / FIT
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase border transition-all",
                    selectedSizes.includes(size)
                      ? "bg-white text-black border-white font-bold"
                      : "bg-black/60 text-neutral-400 border-white/15 hover:border-white/40 hover:text-white"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Ceiling */}
          <div>
            <h4 className="text-[10px] font-mono tracking-[0.25em] text-white uppercase font-bold mb-3 pb-2 border-b border-white/10">
              PRICE CEILING (BDT)
            </h4>
            <div className="space-y-3">
              <input
                type="range"
                min={2000}
                max={15000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs font-mono text-neutral-400">
                <span>৳ 2,000</span>
                <span className="text-white font-bold">UP TO ৳ {maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Department Quick Filter */}
          <div>
            <h4 className="text-[10px] font-mono tracking-[0.25em] text-white uppercase font-bold mb-3 pb-2 border-b border-white/10">
              DEPARTMENT
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "w-full text-left py-1.5 px-3 text-xs font-mono tracking-wider uppercase border transition-colors block",
                  selectedCategory === "all"
                    ? "bg-white/15 text-white border-white/30"
                    : "text-neutral-400 border-transparent hover:text-white"
                )}
              >
                Entire Collection
              </button>
              <button
                onClick={() => setSelectedCategory("baby-frock")}
                className={cn(
                  "w-full text-left py-1.5 px-3 text-xs font-mono tracking-wider uppercase border transition-colors block",
                  selectedCategory === "baby-frock" || selectedCategory === "baby-party-frock" || selectedCategory === "two-piece-kids" || selectedCategory === "three-piece-kids"
                    ? "bg-white/15 text-white border-white/30"
                    : "text-neutral-400 border-transparent hover:text-white"
                )}
              >
                Petite Atelier (1-12Y)
              </button>
              <button
                onClick={() => setSelectedCategory("nayra-dress-skirt")}
                className={cn(
                  "w-full text-left py-1.5 px-3 text-xs font-mono tracking-wider uppercase border transition-colors block",
                  selectedCategory === "adult-three-piece" || selectedCategory === "adult-two-piece" || selectedCategory === "nayra-dress-skirt"
                    ? "bg-white/15 text-white border-white/30"
                    : "text-neutral-400 border-transparent hover:text-white"
                )}
              >
                Maison Femme (Adult Couture)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {filtered.length > 0 ? (
        <div className={cn("grid gap-4 sm:gap-6", gridCols)}>
          {filtered.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center border border-white/10 bg-[#0a0a0f] p-8">
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-brand-500 font-bold mb-2">
            NO PIECES MATCH YOUR FILTER
          </p>
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-4">
            REVISE YOUR ATELIER SEARCH
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto mb-6">
            Try adjusting your price ceiling, size selection, or explore our signature Nayra & Skirt collection.
          </p>
          <button onClick={clearFilters} className="btn-luxury-white text-xs">
            RESET ALL FILTERS
          </button>
        </div>
      )}
    </div>
  );
}
