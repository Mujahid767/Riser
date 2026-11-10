"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/lib/cms/types";

export default function HeroSection({ slides }: { slides: HeroSlide[] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide();
    }, 7000);
    return () => clearInterval(timer);
  }, [activeSlide]);

  const handleNextSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
      setIsTransitioning(false);
    }, 350);
  };

  const handlePrevSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setIsTransitioning(false);
    }, 350);
  };

  const slide = slides[activeSlide] ?? slides[0];
  if (!slide) return null;

  return (
    <section className="relative overflow-hidden bg-[#050507] min-h-[85vh] sm:min-h-[92vh] flex flex-col justify-between border-b border-white/10 select-none">
      {/* Background Image Showcase */}
      <div className="absolute inset-0 z-0">
        <Image
          src={slide.image}
          alt={slide.headline}
          fill
          priority
          sizes="100vw"
          className={cn(
            "object-cover object-center transition-all duration-1000 ease-out transform scale-105",
            isTransitioning ? "opacity-0 scale-110" : "opacity-45 scale-100"
          )}
        />
        {/* Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-[#050507]/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#050507]/50 to-[#050507]" />

        {/* Subtle Architectural Grid Lines */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 container-store flex-1 flex flex-col justify-center py-16 sm:py-24">
        <div className="max-w-3xl">
          {/* Edition Metadata Pill */}
          <div
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/20 backdrop-blur-md text-[10px] sm:text-xs font-mono tracking-[0.28em] text-white uppercase font-semibold mb-6 transition-all duration-500",
              isTransitioning ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span>{slide.tagline}</span>
          </div>

          {/* Monumental Headline */}
          <h1
            className={cn(
              "text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-[0.04em] uppercase leading-[0.95] mb-6 transition-all duration-500 whitespace-pre-line drop-shadow-2xl font-sans",
              isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            )}
          >
            {slide.headline}
          </h1>

          {/* Subheading */}
          <p
            className={cn(
              "text-neutral-300 text-sm sm:text-base md:text-lg max-w-xl font-normal leading-relaxed mb-8 transition-all duration-500",
              isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            )}
          >
            {slide.subheading}
          </p>

          {/* Technical Specs Indicators */}
          <div
            className={cn(
              "hidden sm:flex items-center gap-6 mb-10 pb-6 border-b border-white/10 text-[10px] font-mono tracking-widest text-neutral-400 uppercase transition-all duration-500",
              isTransitioning ? "opacity-0" : "opacity-100"
            )}
          >
            {slide.specs.map((spec, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-brand-500">■</span> {spec}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div
            className={cn(
              "flex flex-col sm:flex-row gap-4 transition-all duration-500",
              isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            )}
          >
            <Link href={slide.cta1Href} className="btn-luxury-white">
              <span>{slide.cta1Label}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link href={slide.cta2Href} className="btn-luxury-outline">
              <span>{slide.cta2Label}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Bottom Bar: Slide Indicators & Luxury Ticker */}
      <div className="relative z-10 border-t border-white/10 bg-[#050507]/90 backdrop-blur-md">
        <div className="container-store py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Active Highlight */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono tracking-[0.25em] text-brand-500 font-bold uppercase">
              FEATURED:
            </span>
            <span className="text-xs font-mono text-white tracking-widest uppercase font-semibold">
              {slide.categoryHighlight}
            </span>
          </div>

          {/* Slide Switchers */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-neutral-400">
              0{activeSlide + 1} / 0{slides.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevSlide}
                className="w-8 h-8 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextSlide}
                className="w-8 h-8 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
