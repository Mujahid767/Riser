import Link from "next/link";
import RiserImage from "@/components/ui/riser-image";
import { ArrowUpRight, Building2, Factory, Globe, MessageCircle, Mail, CheckCircle2 } from "lucide-react";
import { getSiteContent } from "@/lib/cms/store";

export default async function BrandStorySection() {
  const { brand, contact } = await getSiteContent();
  const outlets = contact?.outlets ?? [];
  const factoryEn = contact?.factoryAddress || "Mahmudpur, Signboard, Narayanganj, Bangladesh";
  const factoryBn = contact?.factoryAddressBn || "মাহমুদপুর, সাইনবোর্ড, নারায়ণগঞ্জ";
  const phone = contact?.phone || "+880 1577-049566";
  const whatsapp = contact?.whatsapp || "01577049566";
  const email = contact?.email || "riserclothingshop@gmail.com";
  const waDigits = whatsapp.replace(/\D/g, "");
  const waUrl = `https://wa.me/${waDigits.startsWith("88") ? waDigits : `88${waDigits}`}?text=${encodeURIComponent(
    "Hello Riser, I am an international / retail buyer interested in ordering from your own garments collection."
  )}`;

  return (
    <section className="py-20 sm:py-32 bg-[#050507] border-b border-white/10 select-none overflow-hidden">
      <div className="container-store space-y-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Visual Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] border border-white/15 overflow-hidden bg-[#0a0a0e]">
              <RiserImage
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
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/80 backdrop-blur-md border border-white/20 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-neutral-400">
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

            {/* In-House Factory Highlight Card */}
            <div className="mt-8 p-5 bg-[#0b0b11] border border-brand-500/30 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Factory className="w-5 h-5 text-brand-500 shrink-0" />
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-white font-bold">
                    100% Own Garments Facility — Zero Middlemen
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  Verified Manufacturer
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-mono">
                📍 {factoryEn} <span className="text-neutral-500">({factoryBn})</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[10px] font-mono text-neutral-400">
                {[
                  "In-House Pattern Studio",
                  "Direct Fabric Sourcing",
                  "Artisanal Embroidery",
                  "Export-Grade QC",
                ].map((pill) => (
                  <div key={pill} className="flex items-center gap-1.5 bg-black/50 border border-white/10 px-2.5 py-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{pill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-3 gap-6 my-8 pt-8 border-t border-white/10 font-mono">
              {brand.stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl sm:text-4xl font-black text-white">{stat.value}</p>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={brand.ctaHref} className="btn-luxury-outline">
                <span>{brand.ctaLabel}</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold uppercase tracking-[0.2em] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                International &amp; Wholesale Inquiry
              </a>
            </div>
          </div>
        </div>

        {/* 7 Flagship Retail Outlets + International Buyer Strip */}
        <div className="border border-white/15 bg-[#09090e] p-6 sm:p-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-brand-500 font-bold block mb-2">
                PHYSICAL PRESENCE • DHAKA &amp; NARAYANGANJ
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
                Our Own Garments &amp; {outlets.length} Flagship Showrooms
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
                Foreign &amp; domestic buyers are welcome to visit our manufacturing facility in Narayanganj or any of our {outlets.length} retail outlets across Dhaka&apos;s premier shopping complexes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                WhatsApp: {phone}
              </a>
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/15 bg-white/5 text-neutral-200 hover:border-white/40 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-brand-400" />
                {email}
              </a>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 0: Own Garments Factory */}
            <div className="border border-brand-500/40 bg-gradient-to-br from-brand-500/15 to-black p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-brand-400 mb-2">
                  <span>OWN GARMENTS FACTORY</span>
                  <Factory className="w-4 h-4" />
                </div>
                <h4 className="text-base font-bold text-white uppercase leading-snug">
                  Riser Garments &amp; Production Unit
                </h4>
                <p className="text-xs text-neutral-300 mt-1">{factoryEn}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{factoryBn}</p>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 mt-4 pt-3 border-t border-white/10">
                ✓ Direct Export &amp; Bulk Orders
              </p>
            </div>

            {/* 7 Dhaka Outlets */}
            {outlets.map((o, idx) => (
              <div
                key={o.id || idx}
                className="border border-white/10 bg-black/50 hover:border-white/30 transition-colors p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
                    <span>OUTLET 0{idx + 1} • {o.area.toUpperCase()}</span>
                    <Building2 className="w-3.5 h-3.5 text-brand-500" />
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">{o.mallEn}</h4>
                  <p className="text-xs text-neutral-300 mt-0.5">{o.mallBn}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-brand-400 font-bold">{o.shopEn}</span>
                  <span className="text-neutral-400">{o.shopBn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
