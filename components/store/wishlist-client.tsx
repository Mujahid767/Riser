"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/lib/wishlist/wishlist-store";
import { formatPrice } from "@/lib/utils";
import { addToCart } from "@/lib/cart/cart-store";

type WishlistProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl: string;
  sizes: string[];
  stock?: number;
};

export default function WishlistClient() {
  const { ids, toggle } = useWishlist();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Fetch product details for wishlisted IDs from the shop API
    fetch(`/api/products/batch?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [ids]);

  function handleAddToCart(product: WishlistProduct) {
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrl,
      size: product.sizes[0] ?? "",
      color: "",
      qty: 1,
    });
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => setAddedIds((prev) => prev.filter((id) => id !== product.id)), 2000);
  }

  return (
    <div className="min-h-[60vh]">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full" />
        </div>
      ) : ids.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <Heart className="w-16 h-16 text-neutral-200" />
          <h2 className="text-xl font-semibold text-neutral-900">Your wishlist is empty</h2>
          <p className="text-sm text-neutral-500 max-w-xs">
            Save pieces you love by tapping the heart on any product.
          </p>
          <Link href="/shop" className="btn-luxury mt-2">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {ids.map((id) => {
            const product = products.find((p) => p.id === id);
            if (!product) {
              // Product not loaded yet or deleted — show placeholder
              return (
                <div key={id} className="animate-pulse">
                  <div className="aspect-[3/4] bg-neutral-100 rounded" />
                </div>
              );
            }
            const added = addedIds.includes(product.id);
            const soldOut = typeof product.stock === "number" && product.stock <= 0;
            return (
              <article key={product.id} className="group relative bg-white border border-neutral-100 hover:border-neutral-200 transition-all">
                <Link href={`/product/${product.slug}`} className="block relative">
                  <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
                <button
                  onClick={() => toggle(product.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
                <div className="p-3">
                  <Link href={`/product/${product.slug}`}>
                    <p className="text-xs font-medium text-neutral-800 line-clamp-2 hover:text-brand-600 transition-colors">
                      {product.name}
                    </p>
                  </Link>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">
                    {formatPrice(product.price)}
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="ml-2 text-xs text-neutral-400 line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={soldOut || added}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2 text-xs font-mono uppercase tracking-widest border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {soldOut ? "Sold Out" : added ? "Added ✓" : "Add to Bag"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
