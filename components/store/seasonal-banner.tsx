import Link from "next/link";
import RiserImage from "@/components/ui/riser-image";
import { ArrowRight, Sparkles } from "lucide-react";
import { getSiteContent } from "@/lib/cms/store";

export default async function SeasonalBanner() {
  const { seasonal } = await getSiteContent();

  return (
    <section className="py-16 sm:py-24 bg-[#050507] border-b border-white/10 select-none overflow-hidden">
      <div className="container-store">
        <div className="relative border border-white/15 bg-[#0b0b10] overflow-hidden">
          <div className="grid lg:grid-cols-12 items-stretch min-h-[520px]">
            {/* Left Content Column */}
            <div className="lg:col-span-7 p-8 sm:p-14 lg:p-16 flex flex-col justify-between relative z-10">
              <div>
                {/* Micro badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-[10px] font-mono tracking-[0.3em] uppercase font-bold mb-6">
                  <Sparkles className="w-3 h-3" />
                  {seasonal.badge}
                </div>

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-[0.04em] leading-[0.98] font-sans mb-6">
                  {seasonal.titleLine1}
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-rose-300 to-amber-200">
                    {seasonal.titleLine2}
                  </span>
                </h2>

                <p className="text-neutral-300 text-sm sm:text-base font-light leading-relaxed max-w-lg mb-8">
                  {seasonal.body}
                </p>

                {/* Technical Specifications Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-8 mb-8 border-b border-white/10">
                  {seasonal.specs.map((spec) => (
                    <div key={spec.label}>
                      <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                        {spec.label}
                      </p>
                      <p className="text-xs font-mono font-bold text-white uppercase mt-1">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={seasonal.cta1Href}
                  className="btn-luxury-crimson"
                >
                  <span>{seasonal.cta1Label}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={seasonal.cta2Href}
                  className="btn-luxury-outline"
                >
                  <span>{seasonal.cta2Label}</span>
                </Link>
              </div>
            </div>

            {/* Right Visual Column */}
            <div className="lg:col-span-5 relative min-h-[360px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-white/10 overflow-hidden">
              <RiserImage
                src={seasonal.image}
                alt={seasonal.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center transform hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Watermark Tag */}
              <div className="absolute bottom-6 right-6 p-4 bg-black/70 backdrop-blur-md border border-white/20 text-right">
                <p className="text-[9px] font-mono tracking-[0.3em] uppercase text-neutral-400">
                  {seasonal.archiveLabel}
                </p>
                <p className="text-xs font-mono font-bold text-white uppercase mt-0.5">
                  {seasonal.archiveRef}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
