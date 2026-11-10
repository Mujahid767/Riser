import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowRight, Trash2, Minus, Plus, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Atelier Shopping Bag — Riser",
  description: "Review your curated pieces and proceed to express dispatch.",
};

const DEMO_CART_ITEMS = [
  {
    id: "item-1",
    productName: "Onyx Gold Nayra Cut Kurti with Flared Skirt",
    slug: "onyx-gold-nayra-dress-skirt",
    size: "M",
    color: "Obsidian Noir & Gold",
    price: 6850,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=400&q=80",
    fabric: "Raw Mulberry Silk",
  },
  {
    id: "item-2",
    productName: "Royal Crimson Velvet Gala Baby Frock",
    slug: "royal-crimson-velvet-gala-baby-frock",
    size: "1-2Y",
    color: "Riser Red",
    price: 3850,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=400&q=80",
    fabric: "Plush Micro-Velvet",
  },
];

export default function CartPage() {
  const subtotal = DEMO_CART_ITEMS.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryCharge = 0; // Complimentary atelier dispatch
  const total = subtotal + deliveryCharge;

  return (
    <div className="bg-[#070709] min-h-screen text-white select-none">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#050507]">
        <div className="container-store py-10 sm:py-14">
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-brand-500 font-bold mb-2">
            CLIENT CART
          </p>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-[0.04em] font-sans">
            YOUR ATELIER BAG
          </h1>
        </div>
      </div>

      <div className="container-store py-12">
        {DEMO_CART_ITEMS.length === 0 ? (
          <div className="text-center py-24 bg-[#0a0a0f] border border-white/10 p-8">
            <ShoppingBag className="w-16 h-16 mx-auto text-neutral-600 mb-4" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-2">
              YOUR BAG IS CURRENTLY EMPTY
            </h2>
            <p className="text-xs text-neutral-400 mb-8 max-w-sm mx-auto">
              Explore our signature Nayra & Skirt drop, royal baby frocks, or architectural short tops.
            </p>
            <Link href="/shop" className="btn-luxury-white px-8">
              EXPLORE ATELIER ARCHIVE
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              {DEMO_CART_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0c0c11] border border-white/10 p-4 sm:p-6 flex gap-4 sm:gap-6 items-center"
                >
                  {/* Product Image */}
                  <div className="w-20 h-28 sm:w-24 sm:h-32 relative border border-white/10 overflow-hidden bg-black shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-bold text-white hover:text-neutral-300 transition-colors text-sm sm:text-base leading-tight uppercase line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <button
                        aria-label="Remove item"
                        className="p-1.5 text-neutral-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mt-1">
                      {item.fabric}
                    </p>

                    <div className="flex gap-2 mt-2 text-[10px] font-mono">
                      <span className="bg-black/60 border border-white/15 px-2 py-0.5 text-neutral-300 uppercase">
                        FIT: {item.size}
                      </span>
                      <span className="bg-black/60 border border-white/15 px-2 py-0.5 text-neutral-300 uppercase">
                        SHADE: {item.color}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-white/20 bg-black/60">
                        <button className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <span className="font-mono text-sm sm:text-base font-bold text-white">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <Link
                  href="/shop"
                  className="text-xs font-mono tracking-widest uppercase text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>&larr; CONTINUE BROWSING ARCHIVE</span>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-[#0b0b10] border border-white/15 p-6 sm:p-8 sticky top-28">
                <h2 className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-white pb-3 border-b border-white/10 mb-6">
                  DISPATCH SUMMARY
                </h2>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between text-neutral-300">
                    <span>ARCHIVE SUB-TOTAL</span>
                    <span className="text-white font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>EXPRESS DISPATCH</span>
                    <span className="text-brand-400 font-bold uppercase">COMPLIMENTARY</span>
                  </div>
                  <p className="text-[9px] text-neutral-400">
                    Express courier insured handling nationwide.
                  </p>
                </div>

                <div className="border-t border-white/10 mt-6 pt-4">
                  <div className="flex justify-between font-mono text-base font-bold text-white">
                    <span>ACQUISITION TOTAL</span>
                    <span className="text-brand-400">{formatPrice(total)}</span>
                  </div>
                  <p className="text-[9px] font-mono text-neutral-400 mt-1 uppercase">
                    INCLUSIVE OF ALL DUTIES & TAXES
                  </p>
                </div>

                {/* Voucher code */}
                <div className="mt-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="VIP CODE"
                      className="bg-black/60 border border-white/20 px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 uppercase tracking-widest focus:outline-none focus:border-white flex-1"
                    />
                    <button className="btn-luxury-outline text-xs px-3 py-2">
                      APPLY
                    </button>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="btn-luxury-white w-full mt-6 py-4 text-xs block text-center"
                >
                  PROCEED TO SECURE CHECKOUT &rarr;
                </Link>

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-400 uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                  <span>CASH ON DELIVERY &bull; BKASH &bull; CARDS</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
