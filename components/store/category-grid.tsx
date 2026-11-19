import Link from "next/link";
import RiserImage from "@/components/ui/riser-image";
import { ArrowUpRight } from "lucide-react";
import { getSiteContent } from "@/lib/cms/store";

export default async function CategoryGrid() {
  const { categories } = await getSiteContent();
  const visibleCards = categories.cards.filter((cat) => !cat.hidden);

  if (visibleCards.length === 0) return null;

  return (
    <section className="py-20 sm:py-32 bg-[#070709] border-b border-white/10 select-none">
      <div className="container-store">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-white/10">
          <div>
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-brand-500 font-bold mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-500" />
              {categories.eyebrow}
            </p>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-[0.05em] font-sans">
              {categories.title}
            </h2>
          </div>
          <div className="mt-4 md:mt-0 text-left md:text-right">
            <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              {categories.rightLine1}
            </p>
            <p className="text-[10px] font-mono text-neutral-500 mt-1">
              {categories.rightLine2}
            </p>
          </div>
        </div>

        {/* Editorial Lookbook Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {visibleCards.map((cat) => {
            const isLarge = cat.featured;
            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className={`group relative overflow-hidden bg-[#0d0d12] border border-white/10 hover:border-white/30 transition-all duration-700 flex flex-col justify-between ${
                  isLarge ? "sm:col-span-2 lg:col-span-2 min-h-[380px] sm:min-h-[440px]" : "min-h-[380px] sm:min-h-[440px]"
                }`}
              >
                {/* Background Editorial Image */}
                <div className="absolute inset-0 z-0">
                  <RiserImage
                    src={cat.image}
                    alt={cat.label}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105 opacity-60 group-hover:opacity-75"
                  />
                  {/* Dark Vignette & Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                </div>

                {/* Top Bar: Edition & Arrow */}
                <div className="relative z-10 p-6 flex items-start justify-between">
                  <span className="px-2 py-0.5 text-[9px] font-mono tracking-[0.25em] uppercase font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                    {cat.edition}
                  </span>
                  <div className="w-10 h-10 border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white/70 group-hover:text-white group-hover:border-white transition-all group-hover:scale-110">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 p-6 sm:p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
                  <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-brand-400 font-bold mb-2">
                    {cat.eyebrow}
                  </p>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-wider mb-2 font-sans group-hover:text-neutral-200 transition-colors">
                    {cat.label}
                  </h3>
                  <p className="text-xs text-neutral-300 font-light leading-relaxed line-clamp-2 max-w-md">
                    {cat.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-[0.2em] text-white uppercase font-bold group-hover:underline underline-offset-4">
                      EXPLORE PIECES &rarr;
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase">
                      SERIES 2026
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Prompt */}
        <div className="mt-12 text-center">
          <Link href="/shop" className="btn-luxury-white">
            <span>{categories.archiveLabel}</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
