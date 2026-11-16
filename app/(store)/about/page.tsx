import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Factory,
  Building2,
  Globe,
  ShieldCheck,
  Scissors,
  Sparkles,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { getSiteContent } from "@/lib/cms/store";

export const metadata: Metadata = {
  title: "Our Own Garments & 7 Flagship Outlets — About Riser",
  description:
    "Discover Riser's 100% in-house garments manufacturing facility in Mahmudpur, Signboard, Narayanganj and our 7 retail outlets across Dhaka, Bangladesh. Direct retail, wholesale, and international orders welcome.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const { brand, contact } = await getSiteContent();
  const phone = contact?.phone || "+880 1577-049566";
  const whatsapp = contact?.whatsapp || "01577049566";
  const email = contact?.email || "riserclothingshop@gmail.com";
  const facebook = contact?.facebook || "https://www.facebook.com/profile.php?id=61571749063384";
  const factoryEn = contact?.factoryAddress || "Mahmudpur, Signboard, Narayanganj, Bangladesh";
  const factoryBn = contact?.factoryAddressBn || "মাহমুদপুর, সাইনবোর্ড, নারায়ণগঞ্জ";
  const outlets = contact?.outlets ?? [];

  const waDigits = whatsapp.replace(/\D/g, "");
  const waNumber = waDigits.startsWith("88") ? waDigits : `88${waDigits}`;
  const waInternationalUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    "Hello Riser Factory & Export Desk, I am an international / wholesale buyer and would like to place an order."
  )}`;

  return (
    <div className="bg-[#070709] text-white min-h-screen select-none">
      {/* Hero Banner */}
      <section className="relative border-b border-white/10 py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-[#0d0d15] to-[#070709]">
        <div className="container-store relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-brand-500/40 bg-brand-500/10 text-brand-400 text-[10px] font-mono uppercase tracking-[0.3em]">
              <Factory className="w-3.5 h-3.5" />
              100% In-House Garments Manufacturer • Est. 1998
            </div>
            <h1 className="text-3xl sm:text-6xl font-black uppercase tracking-[0.04em] leading-[1.06]">
              Crafted in Our Own Garments.
              <span className="block text-brand-500 mt-1">Trusted Across {outlets.length} Outlets &amp; Worldwide.</span>
            </h1>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Unlike trading intermediaries, every single Riser dress is engineered, cut, embroidered, and quality-checked in our own manufacturing plant at{" "}
              <strong className="text-white">{factoryEn}</strong> ({factoryBn}) and retailed directly through our{" "}
              <strong className="text-white">{outlets.length} flagship shopping mall outlets in Dhaka</strong>.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={waInternationalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold uppercase tracking-[0.2em] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Order via WhatsApp ({phone})
              </a>
              <Link href="/shop" className="btn-luxury-outline text-xs px-6 py-3.5">
                Browse Complete Collection <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Credentials Strip for International Clients */}
      <section className="border-b border-white/10 bg-[#050508] py-10">
        <div className="container-store grid grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
          {[
            { value: "100% OWN", label: "Garments Factory in Narayanganj", sub: "Zero third-party middlemen" },
            { value: `0${outlets.length} OUTLETS`, label: "Prime Shopping Malls in Dhaka", sub: "Verified retail showrooms" },
            { value: "16\" – 38\"", label: "Precision Graded Sizing", sub: "Age 1 to 12Y & Adult Couture" },
            { value: "GLOBAL", label: "Retail & Wholesale Dispatch", sub: "Nationwide & Overseas Buyers" },
          ].map((stat) => (
            <div key={stat.label} className="border border-white/10 bg-[#0b0b11] p-5">
              <p className="text-2xl sm:text-3xl font-black text-brand-400">{stat.value}</p>
              <p className="text-xs font-bold text-white uppercase tracking-wider mt-1">{stat.label}</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* #craft — Own Garments Manufacturing Section */}
      <section id="craft" className="py-20 border-b border-white/10 scroll-mt-24">
        <div className="container-store grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] border border-white/15 bg-[#0b0b10] overflow-hidden">
              <Image
                src={brand.image}
                alt="Riser Garments Factory in Narayanganj"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 p-4 bg-black/85 border border-white/15 font-mono text-xs space-y-1">
                <p className="text-brand-400 font-bold uppercase tracking-widest text-[10px]">
                  MANUFACTURING FACILITY LOCATION
                </p>
                <p className="text-white font-bold">{factoryEn}</p>
                <p className="text-neutral-400">{factoryBn}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-brand-500 font-bold block">
              VERTICALLY INTEGRATED PRODUCTION • NARAYANGANJ
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-wide">
              Why Foreign &amp; Local Buyers Choose Our Own Garments
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              Narayanganj is the historic heart of Bangladesh&apos;s global textile and apparel industry. At our facility in{" "}
              <strong className="text-white">Mahmudpur, Signboard, Narayanganj</strong>, Riser operates a complete in-house production line dedicated to girls&apos; frocks, Nayra cut sets, two-piece &amp; three-piece ensembles, and women&apos;s couture.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {[
                {
                  icon: Scissors,
                  title: "1. In-House Pattern & Grading",
                  desc: "Every silhouette is drafted by our own master pattern makers with accurate length grading from 16 inches (Age 1) to 38 inches (Age 12) and adult sizes.",
                },
                {
                  icon: Sparkles,
                  title: "2. Artisanal Zari & Embroidery",
                  desc: "Dedicated embroidery, pearl-setting, and lace-work units inside our factory ensure rich detailing that stands up to international boutique standards.",
                },
                {
                  icon: ShieldCheck,
                  title: "3. Skin-Safe Linings & QC",
                  desc: "Soft, breathable cotton inner linings for children's comfort, followed by strict multi-point stitch and measurement inspection before packing.",
                },
                {
                  icon: Globe,
                  title: "4. Factory-Direct Value",
                  desc: "Because you buy directly from the manufacturer, both individual shoppers and foreign wholesale importers get unmatched quality at direct factory prices.",
                },
              ].map((step) => (
                <div key={step.title} className="border border-white/10 bg-[#0b0b11] p-5 space-y-2">
                  <step.icon className="w-5 h-5 text-brand-400" />
                  <h3 className="text-sm font-bold text-white uppercase font-mono">{step.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* #outlets — 7 Flagship Retail Outlets in Dhaka */}
      <section id="outlets" className="py-20 border-b border-white/10 scroll-mt-24">
        <div className="container-store space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-brand-500 font-bold block">
              VERIFIED RETAIL NETWORK • DHAKA, BANGLADESH
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-wide">
              Our {outlets.length} Flagship Showrooms in Dhaka
            </h2>
            <p className="text-neutral-400 text-sm">
              Visit any of our {outlets.length} official retail outlets across Dhaka&apos;s top shopping complexes to experience our fabric quality in person.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {outlets.map((o, idx) => (
              <div
                key={o.id || idx}
                className="border border-white/15 bg-[#0b0b11] p-6 flex flex-col justify-between hover:border-brand-500/50 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-brand-400">
                    <span>SHOWROOM 0{idx + 1}</span>
                    <span className="text-neutral-400">{o.area}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">{o.mallEn}</h3>
                  <p className="text-sm text-neutral-300">{o.mallBn}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 space-y-1 font-mono text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>{o.shopEn}</span>
                  </div>
                  <p className="text-neutral-400 pl-6">🏬 {o.shopBn}</p>
                </div>
              </div>
            ))}

            {/* Factory Card in the grid */}
            <div className="border border-brand-500/40 bg-gradient-to-br from-brand-500/15 to-[#0b0b11] p-6 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-brand-400">
                  <span>MANUFACTURING PLANT</span>
                  <span>NARAYANGANJ</span>
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">Riser Own Garments Factory</h3>
                <p className="text-sm text-neutral-200">{factoryEn}</p>
                <p className="text-sm text-neutral-300">🏭 {factoryBn}</p>
              </div>
              <div className="mt-5 pt-4 border-t border-white/10 text-xs font-mono text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Factory Visits &amp; Bulk Orders by Appointment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* International Buyers & Direct Contact Desk */}
      <section className="py-20">
        <div className="container-store">
          <div className="border border-white/15 bg-gradient-to-br from-[#0e0e16] to-[#08080c] p-8 sm:p-12 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-emerald-400 font-bold block">
                INTERNATIONAL BUYERS • NRB • WHOLESALE &amp; RETAIL
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-wide">
                Ordering From Abroad or Inquiring for Wholesale?
              </h2>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Whether you are an overseas boutique owner looking for a reliable Bangladesh garments manufacturer, a Non-Resident Bangladeshi (NRB) sending gifts to family in Bangladesh, or ordering for international courier delivery, our export &amp; concierge team responds directly on WhatsApp and Email.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-neutral-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Direct / WhatsApp: {phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{email}</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Factory: {factoryEn}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-3">
              <a
                href={waInternationalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold uppercase tracking-[0.2em] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp ({phone})
              </a>
              <a
                href={`mailto:${email}?subject=${encodeURIComponent("International / Wholesale Order Inquiry — Riser")}`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 border border-white/20 hover:border-white text-white text-xs font-mono font-bold uppercase tracking-[0.2em] transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email: {email}
              </a>
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/10 hover:border-white/30 text-neutral-300 hover:text-white text-xs font-mono uppercase tracking-[0.2em] transition-colors"
              >
                Visit Official Facebook Page &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
