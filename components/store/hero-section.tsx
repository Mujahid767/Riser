"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import RiserImage from "@/components/ui/riser-image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/cms/types";

export default function HeroSection({ slides }: { slides: HeroSlide[] }) {
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
    <section className="bg-[#050507] border-b border-white/10 select-none">
      <div className="container-store py-3.5 sm:py-5">
        <div className="border border-white/10 bg-[#0a0a0e] px-4 py-3.5 sm:px-6 sm:py-5 lg:px-8 lg:py-6 flex items-center justify-between gap-4 sm:gap-8">
          {/* Editorial Copy + Actions */}
          <div className="min-w-0 flex-1 space-y-2 sm:space-y-2.5">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.22em] text-neutral-400 uppercase font-semibold max-w-full">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
              <span className="truncate">{slide.tagline}</span>
            </div>

            <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-[2.25rem] font-black text-white tracking-[0.03em] uppercase leading-[1.06] font-sans whitespace-pre-line">
              {slide.headline}
            </h1>

            <p className="hidden sm:line-clamp-2 text-neutral-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              {slide.subheading}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
              <Link
                href={slide.cta1Href}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white text-black border border-white text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase hover:bg-transparent hover:text-white transition-colors"
              >
                <span>{slide.cta1Label}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

              <Link
                href={slide.cta2Href}
                className="inline-flex items-center justify-center px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white/[0.04] text-white border border-white/20 text-[10px] sm:text-[11px] font-bold tracking-[0.16em] uppercase hover:border-white hover:bg-white/10 transition-colors"
              >
                <span>{slide.cta2Label}</span>
              </Link>

              {slides.length > 1 && (
                <div className="inline-flex items-center gap-1 ml-1 sm:ml-2">
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="w-7 h-7 sm:w-8 sm:h-8 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="w-7 h-7 sm:w-8 sm:h-8 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 3:4 Portrait Showcase matching ProductCard proportions */}
          <Link
            href={slide.cta1Href}
            className="group relative block w-[82px] sm:w-[126px] lg:w-[146px] aspect-[3/4] overflow-hidden border border-white/15 bg-neutral-950 shrink-0"
            aria-label={slide.categoryHighlight}
          >
            <RiserImage
              src={slide.image}
              alt={slide.headline}
              fill
              preload
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 640px) 82px, (max-width: 1024px) 126px, 146px"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
