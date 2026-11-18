"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  Truck,
  Minus,
  Plus,
  Shield,
  ArrowRight,
  Sparkles,
  Scissors,
  Check,
  MessageCircle,
} from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import { addToCart } from "@/lib/cart/cart-store";
import { analytics } from "@/lib/analytics";
import { MAX_QTY_PER_LINE, SHIPPING_RATES } from "@/lib/shipping";
import type { StoreProduct } from "@/lib/catalog";
import {
  getPriceForSize,
  getStockForSize,
  hasPerSizeStock,
} from "@/lib/products/types";
import ProductCard from "@/components/product/product-card";
import MeasurementChart from "@/components/product/measurement-chart";
import ReviewSection from "@/components/product/review-section";
import { useWishlist } from "@/lib/wishlist/wishlist-store";

interface ProductDetailClientProps {
  product: StoreProduct;
  related: StoreProduct[];
}

export default function ProductDetailClient({ product, related }: ProductDetailClientProps) {
  const router = useRouter();
  const { toggle: toggleWishlist, check: isWishlisted } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0]?.name ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.imageUrl);
  const [imageError, setImageError] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "ok"; text: string } | null>(null);

  // Fire ViewContent once per product page load
  useEffect(() => {
    analytics.viewContent({
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const activePrice = getPriceForSize(product.price, product.sizePrices, selectedSize);
  const allSizePrices = (product.sizes ?? []).map((s) =>
    getPriceForSize(product.price, product.sizePrices, s)
  );
  const minSizePrice = allSizePrices.length > 0 ? Math.min(...allSizePrices) : product.price;
  const maxSizePrice = allSizePrices.length > 0 ? Math.max(...allSizePrices) : product.price;
  const hasMultiplePrices = minSizePrice !== maxSizePrice;

  const discount = calculateDiscount(activePrice, product.compareAtPrice);
  const perSizeTracked = hasPerSizeStock(product.sizeStock);
  const activeStock = selectedSize
    ? getStockForSize(product.stock, product.sizeStock, selectedSize)
    : product.stock;
  const soldOut = activeStock === 0;
  const maxQty = Math.max(
    1,
    Math.min(MAX_QTY_PER_LINE, activeStock ?? MAX_QTY_PER_LINE)
  );
  const lowStock =
    activeStock !== undefined && activeStock > 0 && activeStock <= 5;

  const images = [product.imageUrl, product.secondaryImageUrl, ...(product.gallery ?? [])].filter(
    (img, i, arr): img is string => Boolean(img) && arr.indexOf(img) === i
  );

  /** Returns true when the item was added. */
  const handleAddToCart = (): boolean => {
    if (soldOut) return false;
    if (product.sizes?.length && !selectedSize) {
      setMessage({ type: "error", text: "Please select a size first." });
      return false;
    }
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      price: activePrice,
      size: selectedSize ?? "",
      color: selectedColor ?? "",
      qty: quantity,
    });
    // Fire AddToCart analytics event
    analytics.addToCart({
      productId: product.id,
      productName: product.name,
      variant: [selectedSize, selectedColor].filter(Boolean).join(" / ") || undefined,
      price: activePrice,
      quantity,
    });
    setMessage({ type: "ok", text: "Added to your bag." });
    return true;
  };

  const handleBuyNow = () => {
    if (handleAddToCart()) router.push("/checkout");
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

            {/* Age → length measurements for this product's sizes */}
            <MeasurementChart sizes={product.sizes} />
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
                  {selectedSize || !hasMultiplePrices
                    ? formatPrice(activePrice)
                    : `${formatPrice(minSizePrice)} – ${formatPrice(maxSizePrice)}`}
                </span>
                {product.compareAtPrice && product.compareAtPrice > activePrice && (
                  <span className="text-sm font-mono text-neutral-500 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest ml-2">
                  {selectedSize ? `SIZE ${selectedSize}` : "INCLUSIVE OF ALL TAXES"}
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
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {product.sizes.map((size) => {
                      const sizePrice = getPriceForSize(product.price, product.sizePrices, size);
                      const sizeAvail = getStockForSize(product.stock, product.sizeStock, size);
                      const sizeSoldOut = perSizeTracked && sizeAvail === 0;
                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={sizeSoldOut}
                          onClick={() => {
                            setSelectedSize(size);
                            if (typeof sizeAvail === "number" && sizeAvail > 0) {
                              setQuantity((q) => Math.min(q, Math.min(MAX_QTY_PER_LINE, sizeAvail)));
                            }
                            setMessage(null);
                          }}
                          className={cn(
                            "py-2.5 px-2 text-xs font-mono tracking-wider uppercase border transition-all text-center flex flex-col items-center justify-center gap-0.5",
                            sizeSoldOut
                              ? "bg-black/20 text-neutral-600 border-white/10 line-through cursor-not-allowed"
                              : selectedSize === size
                                ? "bg-white text-black border-white font-bold shadow-lg shadow-white/20"
                                : "bg-black/50 text-neutral-300 border-white/15 hover:border-white/50 hover:text-white"
                          )}
                        >
                          <span>{size}</span>
                          {sizeSoldOut ? (
                            <span className="text-[9px] text-neutral-500 no-underline">Sold Out</span>
                          ) : hasMultiplePrices ? (
                            <span
                              className={cn(
                                "text-[10px]",
                                selectedSize === size ? "text-neutral-700" : "text-brand-400"
                              )}
                            >
                              {formatPrice(sizePrice)}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
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
                      onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                      className="px-3 text-neutral-400 hover:text-white transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Bag */}
                  <button
                    type="button"
                    onClick={() => void handleAddToCart()}
                    disabled={soldOut}
                    className="flex-1 btn-luxury-white h-12 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{soldOut ? "SOLD OUT" : "ADD TO BAG"}</span>
                  </button>

                  {/* Wishlist */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className="w-12 h-12 border border-white/20 bg-black/40 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all"
                    aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart
                      className={cn(
                        "w-4 h-4",
                        isWishlisted(product.id) ? "fill-brand-500 text-brand-500" : ""
                      )}
                    />
                  </button>
                </div>

                {lowStock && (
                  <p className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
                    Only {activeStock} left{selectedSize && perSizeTracked ? ` in size ${selectedSize}` : ""}
                  </p>
                )}

                {message && (
                  <p
                    role="status"
                    className={cn(
                      "text-[11px] font-mono uppercase tracking-widest flex items-center gap-2",
                      message.type === "error" ? "text-red-400" : "text-emerald-400"
                    )}
                  >
                    {message.type === "ok" && <Check className="w-3.5 h-3.5" />}
                    {message.text}
                    {message.type === "ok" && (
                      <Link href="/cart" className="underline underline-offset-4 text-white ml-1">
                        View bag
                      </Link>
                    )}
                  </p>
                )}

                {!soldOut && (
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full btn-luxury-crimson py-3.5 text-center block text-xs"
                  >
                    BUY NOW &bull; CASH ON DELIVERY
                  </button>
                )}

                <a
                  href={`https://wa.me/8801577049566?text=${encodeURIComponent(
                    `Hello Riser Atelier, I want to inquire about "${product.name}" (Price: ৳${activePrice}${selectedSize ? `, Size: ${selectedSize}` : ""}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-3 text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  Order / Inquire on WhatsApp
                </a>
              </div>

              {/* Atelier Pillars */}
              <div className="pt-6 border-t border-white/10 space-y-3 text-[11px] font-mono text-neutral-400 uppercase">
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>
                    Delivery ৳{SHIPPING_RATES.dhaka} inside Dhaka &bull; ৳{SHIPPING_RATES.outsideDhaka} outside Dhaka &bull; Cash on delivery
                  </span>
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

      {/* Reviews */}
      <div className="bg-white">
        <div className="container-store max-w-4xl py-10">
          <ReviewSection productId={product.id} />
        </div>
      </div>
    </div>
  );
}
