import { ShieldCheck, RotateCcw, Truck, Scissors, Clock, PhoneCall } from "lucide-react";
import { getSiteContent } from "@/lib/cms/store";
import type { TrustItem } from "@/lib/cms/types";

const ICONS = {
  shield: ShieldCheck,
  truck: Truck,
  returns: RotateCcw,
  scissors: Scissors,
  clock: Clock,
  phone: PhoneCall,
} satisfies Record<TrustItem["icon"], typeof ShieldCheck>;

export default async function TrustSection() {
  const { trust } = await getSiteContent();

  return (
    <section className="py-20 sm:py-28 bg-[#070709] border-b border-white/10 select-none">
      <div className="container-store">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-[10px] font-mono tracking-[0.35em] uppercase text-brand-500 font-bold mb-3">
            {trust.eyebrow}
          </p>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-[0.05em] font-sans">
            {trust.title}
          </h2>
          <p className="mt-3 text-neutral-400 text-xs sm:text-sm font-light">
            {trust.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-8 bg-[#0a0a0f] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 border border-white/15 bg-black/60 flex items-center justify-center text-white mb-6 group-hover:border-white/40 group-hover:scale-105 transition-all">
                  <f.icon className="w-4 h-4 text-brand-400" />
                </div>
                <h3 className="font-mono text-xs font-bold text-white tracking-[0.2em] uppercase mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                  {f.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-neutral-500 uppercase">
                <span>VERIFIED</span>
                <span>RISER &bull; BD</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
