import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getSiteContent } from "@/lib/cms/store";

export default async function BrandStorySection() {
  const { brand } = await getSiteContent();

  return (
    <section className="py-20 sm:py-32 bg-[#050507] border-b border-white/10 select-none overflow-hidden">
      <div className="container-store">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Visual Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] border border-white/15 overflow-hidden bg-[#0a0a0e]">
              <Image
                src={brand.image}
                alt={brand.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transform hover:scale-105 transition-transform duration-1000 ease-out opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              {/* Floating Architectural Badge */}
              <div className="absolute top-6 left-6 p-4 bg-black/80 backdrop-blur-md border border-white/20">
                <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-brand-500 font-bold block">
                  {brand.heritageLabel}
                </span>
                <span className="text-xl font-black text-white font-sans tracking-wider">
                  {brand.established}
                </span>
              </div>

              {/* Technical Indicator Bottom */}
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>{brand.badgeLeft}</span>
                <span className="text-white font-bold">{brand.badgeRight}</span>
              </div>
            </div>
          </div>

          {/* Right Narrative */}
          <div className="lg:col-span-6">
            <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-brand-500 font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-500" />
              {brand.eyebrow}
            </p>

            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-[0.05em] leading-[1.05] font-sans mb-8">
              {brand.titleLine1}
              <br />
              {brand.titleLine2}
            </h2>

            <div className="space-y-6 text-neutral-300 text-sm sm:text-base font-light leading-relaxed">
              <p>{brand.paragraph1}</p>
              <p>{brand.paragraph2}</p>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 my-10 pt-8 border-t border-white/10 font-mono">
              {brand.stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl sm:text-4xl font-black text-white">{stat.value}</p>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link href={brand.ctaHref} className="btn-luxury-outline">
              <span>{brand.ctaLabel}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
