"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RiserImage from "@/components/ui/riser-image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryCard, HeroSlide } from "@/lib/cms/types";

interface Props {
  slides: HeroSlide[];
  categories?: CategoryCard[];
}

export default function HeroSection({ slides, categories = [] }: Props) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const safeIndex = slides.length > 0 ? activeSlide % slides.length : 0;
  const slide = slides[safeIndex] ?? slides[0];
  if (!slide) return null;

  const handleNextSlide = () => {
    if (slides.length <= 1) return;
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    if (slides.length <= 1) return;
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative overflow-hidden bg-[#050507] border-b border-white/10 select-none">
      {/* Compact Editorial Strip */}
      <div className="container-store py-5 sm:py-7 lg:py-8">
        <div className="grid grid-cols-[minmax(0,1fr)_96px] sm:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(0,1fr)_300px] gap-4 sm:gap-7 items-center">
          {/* Copy + Actions */}
          <div className="min-w-0 space-y-2.5 sm:space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-[0.2em] text-neutral-300 uppercase font-semibold min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                <span className="truncate">{slide.tagline}</span>
              </div>

              {slides.length > 1 && (
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[11px] text-neutral-500">
                    0{safeIndex + 1} / 0{slides.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      className="w-7 h-7 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextSlide}
                      className="w-7 h-7 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-black text-white tracking-[0.03em] uppercase leading-[1.03] font-sans whitespace-pre-line">
              {slide.headline}
            </h1>

            <p className="hidden sm:line-clamp-2 text-neutral-300 text-xs sm:text-sm max-w-xl font-normal leading-relaxed">
              {slide.subheading}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5">
              <Link
                href={slide.cta1Href}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 bg-white text-black border border-white text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase hover:bg-transparent hover:text-white transition-colors"
              >
                <span>{slide.cta1Label}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

              <Link
                href={slide.cta2Href}
                className="inline-flex items-center justify-center px-3.5 py-2 sm:px-5 sm:py-2.5 bg-white/[0.04] text-white border border-white/20 text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase hover:border-white hover:bg-white/10 transition-colors"
              >
                <span>{slide.cta2Label}</span>
              </Link>

              {slides.length > 1 && (
                <div className="flex sm:hidden items-center gap-1 ml-auto">
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="w-7 h-7 border border-white/15 flex items-center justify-center text-white/70 hover:text-white"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="w-7 h-7 border border-white/15 flex items-center justify-center text-white/70 hover:text-white"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Crisp Framed Editorial Photo (no distracting dark overlay over products) */}
          <Link
            href={slide.cta1Href}
            className="group relative block w-full aspect-[3/4] sm:aspect-[4/3] overflow-hidden border border-white/15 bg-[#0d0d12] shrink-0"
            aria-label={slide.categoryHighlight}
          >
            <RiserImage
              src={slide.image}
              alt={slide.headline}
              fill
              preload
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 640px) 96px, (max-width: 1024px) 220px, 300px"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="hidden sm:flex absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 py-2 items-center justify-between gap-2">
              <span className="text-[9px] font-mono tracking-[0.2em] text-white/90 uppercase truncate">
                {slide.categoryHighlight}
              </span>
              <ArrowRight className="w-3 h-3 text-white/80 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Category Quick Links Bar */}
      <div className="border-t border-white/10 bg-[#08080c]">
        <div className="container-store py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none sm:flex-wrap">
          <span className="hidden sm:inline text-[10px] font-mono tracking-[0.22em] text-neutral-500 uppercase shrink-0 mr-1">
            Shop by Category:
          </span>
          <Link
            href="/shop"
            className={cn(
              "px-3 py-1.5 text-[10px] sm:text-[11px] font-mono tracking-[0.16em] uppercase whitespace-nowrap shrink-0 border transition-colors",
              "bg-white text-black border-white font-bold hover:bg-neutral-200"
            )}
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="px-3 py-1.5 text-[10px] sm:text-[11px] font-mono tracking-[0.16em] uppercase whitespace-nowrap shrink-0 border border-white/15 bg-white/[0.03] text-neutral-200 hover:bg-white hover:text-black hover:border-white transition-colors"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
