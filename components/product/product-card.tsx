"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Eye, ArrowUpRight } from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl: string;
  secondaryImageUrl?: string | null;
  isNew?: boolean;
  isBestSeller?: boolean;
  isLimited?: boolean;
  isOnSale?: boolean;
  editionBadge?: string;
  fabric?: string;
  colors?: Array<{ name: string; value: string }>;
  sizes?: string[];
  className?: string;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  imageUrl,
  secondaryImageUrl,
  isNew,
  isBestSeller,
  isLimited,
  isOnSale,
  editionBadge,
  fabric,
  colors = [],
  sizes = [],
  className,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const discount = calculateDiscount(price, compareAtPrice);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <article
      className={cn(
        "group relative bg-[#0a0a0d] border border-white/10 hover:border-white/30 transition-all duration-500 flex flex-col justify-between overflow-hidden",
        className
      )}
    >
      <Link href={`/product/${slug}`} aria-label={name} className="block relative">
        {/* Image Container with 3:4 portrait aspect ratio */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950">
          {imageUrl && !imageError ? (
            <>
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                onError={() => setImageError(true)}
              />
              {secondaryImageUrl && (
                <Image
                  src={secondaryImageUrl}
                  alt={`${name} — alternate angle`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out"
                />
              )}
            </>
          ) : (
            /* Luxury Silhouette Placeholder */
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 via-neutral-950 to-black p-6 text-center">
              <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-3">
                <span className="font-serif text-white/40 text-xl font-light italic">R</span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-mono">
                RISER ARCHIVE
              </p>
            </div>
          )}

          {/* Vignette Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
            <div className="flex flex-col gap-1 items-start">
              {editionBadge ? (
                <span className="px-2 py-0.5 text-[9px] font-mono tracking-[0.2em] uppercase font-bold bg-black/70 backdrop-blur-md text-white border border-white/20">
                  {editionBadge}
                </span>
              ) : isLimited ? (
                <span className="px-2 py-0.5 text-[9px] font-mono tracking-[0.2em] uppercase font-bold bg-brand-600 text-white shadow-lg shadow-brand-600/40">
                  LIMITED DROP
                </span>
              ) : isNew ? (
                <span className="px-2 py-0.5 text-[9px] font-mono tracking-[0.2em] uppercase font-bold bg-white/10 backdrop-blur-md text-white border border-white/20">
                  NEW ARCHIVE
                </span>
              ) : isBestSeller ? (
                <span className="px-2 py-0.5 text-[9px] font-mono tracking-[0.2em] uppercase font-bold bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-500/30">
                  SIGNATURE PIECE
                </span>
              ) : null}

              {discount && (
                <span className="px-1.5 py-0.5 text-[8px] font-mono tracking-widest uppercase font-bold bg-brand-500/90 text-white">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              className="pointer-events-auto w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition-all hover:scale-110"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={cn(
                  "w-3.5 h-3.5 transition-colors",
                  isWishlisted ? "fill-brand-500 text-brand-500" : ""
                )}
              />
            </button>
          </div>

          {/* Quick-Action Bar Sliding Up on Hover */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10 flex flex-col gap-2">
            {sizes.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none justify-center">
                {sizes.slice(0, 5).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                    className={cn(
                      "px-2 py-1 text-[9px] font-mono tracking-wider uppercase border transition-all",
                      selectedSize === size
                        ? "bg-white text-black border-white"
                        : "bg-black/60 text-white/70 border-white/20 hover:border-white/50"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] tracking-[0.2em] uppercase text-white font-semibold flex items-center gap-1 group-hover:text-brand-400 transition-colors">
                VIEW DETAILS
                <ArrowUpRight className="w-3 h-3" />
              </span>
              <span className="text-[9px] font-mono text-neutral-400">
                {fabric ? fabric.split("&")[0].trim() : "ATELIER CRAFT"}
              </span>
            </div>
          </div>
        </div>

        {/* Content Meta */}
        <div className="p-4 flex flex-col gap-2 bg-[#0a0a0d]">
          {/* Colors Swatches */}
          {colors.length > 0 && (
            <div className="flex items-center gap-1.5">
              {colors.map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="w-2.5 h-2.5 rounded-full border border-white/30"
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest ml-1">
                {colors.length} {colors.length === 1 ? "shade" : "shades"}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-sans font-medium text-white text-xs sm:text-sm tracking-wide line-clamp-1 group-hover:text-neutral-200 transition-colors">
            {name}
          </h3>

          {/* Price & Currency */}
          <div className="flex items-baseline gap-2 pt-1 border-t border-white/5">
            <span className="font-mono text-sm sm:text-base font-bold text-white tracking-tight">
              {formatPrice(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="font-mono text-xs text-neutral-500 line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
