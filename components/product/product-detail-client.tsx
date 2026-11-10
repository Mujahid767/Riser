"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  Shield,
  ArrowRight,
  Sparkles,
  Scissors,
} from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import { getSeedProductBySlug, getSeedProducts } from "@/lib/utils/seed-products";
import ProductCard from "@/components/product/product-card";

interface ProductDetailClientProps {
  slug: string;
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const product = getSeedProductBySlug(slug);

  if (!product) notFound();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0]?.name ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImage, setActiveImage] = useState(product.imageUrl);
  const [imageError, setImageError] = useState(false);

  const discount = calculateDiscount(product.price, product.compareAtPrice);
  const related = getSeedProducts()
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  const images = [product.imageUrl, product.secondaryImageUrl].filter(Boolean) as string[];

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size before proceeding to the bag.");
      return;
    }
    alert(`Added to Bag: ${product.name} [Size: ${selectedSize}]`);
  };

  return (
    <div className="bg-[#070709] min-h-screen text-white select-none">
      {/* Breadcrumb Header */}
      <div className="border-b border-white/10 bg-[#050507]">
        <div className="container-store py-4">
          <nav className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
            <Link href="/" className="hover:text-white transition-colors">
              ATELIER
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-white transition-colors">
              ARCHIVE
            </Link>
            <span>/</span>
            <Link
              href={`/shop?category=${product.category}`}
              className="hover:text-white transition-colors text-brand-400"
            >
              {product.category.replace(/-/g, " ")}
            </Link>
            <span>/</span>
            <span className="text-white line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="container-store py-12 sm:py-16">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] w-full bg-[#0d0d12] border border-white/15 overflow-hidden">
              {activeImage && !imageError ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-center"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-black p-8 text-center">
                  <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center mb-4">
                    <span className="font-serif text-white/40 text-3xl italic">R</span>
                  </div>
                  <p className="text-xs font-mono tracking-[0.3em] uppercase text-neutral-400">
                    RISER COUTURE ATELIER
                  </p>
                </div>
              )}

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                {product.editionBadge && (
                  <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.25em] uppercase font-bold bg-black/80 backdrop-blur-md text-white border border-white/20">
                    {product.editionBadge}
                  </span>
                )}
                {product.isLimited && (
                  <span className="px-2.5 py-1 text-[9px] font-mono tracking-[0.25em] uppercase font-bold bg-brand-600 text-white shadow-lg shadow-brand-600/40">
                    LIMITED DROP
                  </span>
                )}
                {discount && (
                  <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase font-bold bg-white text-black">
                    -{discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Switcher */}
            {images.length > 1 && (
              <div className="flex items-center gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "relative w-20 h-24 border overflow-hidden transition-all bg-[#0d0d12]",
                      activeImage === img
                        ? "border-white shadow-lg shadow-white/10"
                        : "border-white/15 opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Editorial Details */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Reference ID & Department */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                <span>REF: {product.id}</span>
                <span className="text-brand-400 font-bold">
                  {product.department === "petite" ? "PETITE ATELIER" : "MAISON FEMME"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-[0.04em] leading-tight font-sans mt-4 mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm font-mono text-neutral-500 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest ml-2">
                  INCLUSIVE OF ALL TAXES
                </span>
              </div>

              {/* Fabric Craft Highlight */}
              {product.fabric && (
                <div className="p-3.5 bg-white/5 border border-white/10 mb-6 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
                      FABRIC SPECIFICATION
                    </p>
                    <p className="text-xs font-mono font-bold text-white mt-0.5">
                      {product.fabric}
                    </p>
                  </div>
                </div>
              )}

              {/* Narrative Description */}
              <p className="text-sm text-neutral-300 font-light leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-2">
                    <span className="text-neutral-400">SHADE SELECTION:</span>
                    <span className="text-white font-bold">{selectedColor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all p-0.5 flex items-center justify-center",
                          selectedColor === c.name
                            ? "border-white scale-110 shadow-lg shadow-white/20"
                            : "border-white/20 hover:border-white/50"
                        )}
                        title={c.name}
                      >
                        <span
                          className="w-full h-full rounded-full"
                          style={{ backgroundColor: c.value }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-2.5">
                    <span className="text-neutral-400">SELECT ATELIER SIZE:</span>
                    <Link
                      href="/size-guide"
                      className="text-brand-400 hover:text-white underline underline-offset-4 text-[10px]"
                    >
                      MEASUREMENT GUIDE
                    </Link>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "py-2.5 text-xs font-mono tracking-wider uppercase border transition-all text-center",
                          selectedSize === size
                            ? "bg-white text-black border-white font-bold shadow-lg shadow-white/20"
                            : "bg-black/50 text-neutral-300 border-white/15 hover:border-white/50 hover:text-white"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & CTA Buttons */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-white/20 bg-black/40 h-12">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 text-neutral-400 hover:text-white transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-mono text-xs font-bold text-white min-w-[28px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 text-neutral-400 hover:text-white transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Bag */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 btn-luxury-white h-12 text-xs"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>ADD TO BAG</span>
                  </button>

                  {/* Wishlist */}
                  <button
                    type="button"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="w-12 h-12 border border-white/20 bg-black/40 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all"
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      className={cn(
                        "w-4 h-4",
                        isWishlisted ? "fill-brand-500 text-brand-500" : ""
                      )}
                    />
                  </button>
                </div>

                {/* Instant Buy with Crimson */}
                <Link
                  href="/checkout"
                  className="w-full btn-luxury-crimson py-3.5 text-center block text-xs"
                >
                  ACQUIRE PIECE &bull; PROCEED TO DISPATCH
                </Link>
              </div>

              {/* Atelier Pillars */}
              <div className="pt-6 border-t border-white/10 space-y-3 text-[11px] font-mono text-neutral-400 uppercase">
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Complimentary Insured Express Dispatch Inside Dhaka</span>
                </div>
                <div className="flex items-center gap-3">
                  <Scissors className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Custom Atelier Alterations & Fitting Adjustments Available</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>100% Genuine Handcrafted Fabric Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Pieces */}
        {related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-white/10">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-brand-500 font-bold mb-1">
                  COMPLEMENTARY ATELIER
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-sans">
                  SIMILAR ARCHIVE PIECES
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs font-mono tracking-widest text-neutral-400 hover:text-white uppercase flex items-center gap-1"
              >
                <span>VIEW ALL</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
