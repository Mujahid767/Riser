"use client";

import Link from "next/link";
import RiserImage from "@/components/ui/riser-image";
import { ShoppingBag, Trash2, Minus, Plus, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { removeLine, setLineQty, useCart } from "@/lib/cart/cart-store";
import { MAX_QTY_PER_LINE, SHIPPING_RATES } from "@/lib/shipping";

export default function CartClient() {
  const { lines, count, subtotal } = useCart();

  return (
    <div className="bg-[#070709] min-h-screen text-white select-none">
      <div className="border-b border-white/10 bg-[#050507]">
        <div className="container-store py-10 sm:py-14">
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-brand-500 font-bold mb-2">
            YOUR CART
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-[0.04em] font-sans">
            SHOPPING BAG
          </h1>
        </div>
      </div>

      <div className="container-store py-12">
        {lines.length === 0 ? (
          <div className="text-center py-24 bg-[#0a0a0f] border border-white/10 p-8">
            <ShoppingBag className="w-16 h-16 mx-auto text-neutral-600 mb-4" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-2">
              YOUR BAG IS EMPTY
            </h2>
            <p className="text-xs text-neutral-400 mb-8 max-w-sm mx-auto">
              Browse our dresses, baby frocks, two-piece and three-piece sets and short tops.
            </p>
            <Link href="/shop" className="btn-luxury-white px-8">
              CONTINUE SHOPPING
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-4">
              {lines.map((item) => (
                <div
                  key={item.key}
                  className="bg-[#0c0c11] border border-white/10 p-4 sm:p-6 flex gap-4 sm:gap-6 items-center"
                >
                  <div className="w-20 h-28 sm:w-24 sm:h-32 relative border border-white/10 overflow-hidden bg-black shrink-0">
                    {item.imageUrl && (
                      <RiserImage
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-bold text-white hover:text-neutral-300 transition-colors text-sm sm:text-base leading-tight uppercase line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeLine(item.key)}
                        className="p-1.5 text-neutral-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-mono">
                      {item.size && (
                        <span className="bg-black/60 border border-white/15 px-2 py-0.5 text-neutral-300 uppercase">
                          SIZE: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="bg-black/60 border border-white/15 px-2 py-0.5 text-neutral-300 uppercase">
                          COLOUR: {item.color}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-white/20 bg-black/60">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setLineQty(item.key, item.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-bold text-white">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={item.qty >= MAX_QTY_PER_LINE}
                          onClick={() => setLineQty(item.key, item.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono text-sm sm:text-base font-bold text-white">
                        {formatPrice(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <Link
                  href="/shop"
                  className="text-xs font-mono tracking-widest uppercase text-neutral-400 hover:text-white transition-colors"
                >
                  &larr; CONTINUE SHOPPING
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-[#0b0b10] border border-white/15 p-6 sm:p-8 sticky top-28">
                <h2 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-white pb-3 border-b border-white/10 mb-6">
                  ORDER SUMMARY
                </h2>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between text-neutral-300">
                    <span>
                      SUBTOTAL ({count} {count === 1 ? "ITEM" : "ITEMS"})
                    </span>
                    <span className="text-white font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>DELIVERY</span>
                    <span className="text-neutral-400">AT CHECKOUT</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-relaxed">
                    ৳{SHIPPING_RATES.dhaka} inside Dhaka, ৳{SHIPPING_RATES.outsideDhaka} outside
                    Dhaka. Exact charge is shown once you pick your district.
                  </p>
                </div>

                <Link
                  href="/checkout"
                  className="btn-luxury-white w-full mt-8 py-4 text-xs block text-center"
                >
                  PROCEED TO CHECKOUT &rarr;
                </Link>

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-400 uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                  <span>CASH ON DELIVERY AVAILABLE</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
