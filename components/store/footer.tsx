"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, ArrowRight, MessageCircle } from "lucide-react";
import type { SiteContent } from "@/lib/cms/types";

const footerLinks = {
  collections: [
    { label: "Nayra Dress with Skirt", href: "/shop?category=nayra-dress-skirt" },
    { label: "Baby Frocks (0-5Y)", href: "/shop?category=baby-frock" },
    { label: "Kids Two-Piece Sets", href: "/shop?category=two-piece-kids" },
    { label: "Kids Three-Piece Sets", href: "/shop?category=three-piece-kids" },
    { label: "Adult Girls One-Piece", href: "/shop?category=adult-one-piece" },
    { label: "Adult Girls Two-Piece", href: "/shop?category=adult-two-piece" },
    { label: "Adult Girls Three-Piece", href: "/shop?category=adult-three-piece" },
    { label: "Architectural Short Tops", href: "/shop?category=short-tops" },
  ],
  clientCare: [
    { label: "Size Guide", href: "/size-guide" },
    { label: "Bespoke Fitting", href: "/contact" },
    { label: "My Wishlist", href: "/wishlist" },
    { label: "Order Tracking", href: "/track-order" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Return & Exchange Policy", href: "/return-policy" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  maison: [
    { label: "The Atelier Manifesto", href: "/about" },
    { label: "Flagship Boutiques", href: "/about#outlets" },
    { label: "Authenticity Registry", href: "/about#craft" },
    { label: "Admin Portal", href: "/admin" },
  ],
};

export default function Footer({
  content,
}: {
  content?: SiteContent;
} = {}) {
  const phone = content?.contact?.phone || content?.footer.phone || "01577049566";
  const whatsapp = content?.contact?.whatsapp || "01577049566";
  const email = content?.contact?.email || content?.footer.email || "atelier@riser.com.bd";
  const address = content?.contact?.address || content?.footer.address || "Gulshan 2 • Banani • Dhanmondi, Dhaka";
  const brandBlurb = content?.footer?.brandBlurb || "Haute couture and luxury garments for girls and women. Redefining heirloom baby frocks, statement Nayra cuts with twirl skirts, tailored two-piece sets, imperial three-piece suits, and architectural short tops.";
  const fb = content?.contact?.facebook || "https://facebook.com/riser.atelier";
  const insta = content?.contact?.instagram || "https://instagram.com/riser.atelier";
  const waDigits = whatsapp.replace(/\D/g, "");
  const waUrl = `https://wa.me/${waDigits.startsWith("88") ? waDigits : `88${waDigits}`}?text=${encodeURIComponent(content?.contact?.whatsappMessage || "Hello Riser Atelier, I have an inquiry.")}`;

  return (
    <footer className="bg-[#040406] text-neutral-400 border-t border-white/10 select-none">
      {/* VIP Access Marquee & Newsletter */}
      <div className="border-b border-white/10 py-16 sm:py-20">
        <div className="container-store">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6">
              <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-brand-500 font-bold mb-2 block">
                {content?.footer.newsletterEyebrow || "[ THE INSIDERS CIRCLE ]"}
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-[0.05em] font-sans">
                {content?.footer.newsletterTitle || "JOIN THE ATELIER REGISTRY"}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-md font-light">
                {content?.footer.newsletterBody || "Receive priority private links 24 hours prior to public drops, private salon invitations, and bespoke tailoring access."}
              </p>
            </div>

            <div className="lg:col-span-6">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col sm:flex-row gap-3 max-w-md lg:ml-auto"
              >
                <input
                  type="email"
                  placeholder="ENTER CLIENT EMAIL"
                  className="bg-black/60 border border-white/20 px-4 py-3 text-xs font-mono tracking-widest text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors flex-1"
                />
                <button
                  type="submit"
                  className="btn-luxury-white text-xs px-6 py-3 whitespace-nowrap"
                >
                  SUBSCRIBE
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="container-store py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-sans text-3xl font-black text-white tracking-[0.3em] block">
                RISER
              </span>
              <span className="text-[8px] font-mono text-neutral-400 tracking-[0.45em] uppercase font-semibold">
                ATELIER &bull; COUTURE
              </span>
            </Link>
            <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-sm mt-3">
              {brandBlurb}
            </p>

            <div className="mt-8 space-y-3 text-xs font-mono">
              <div className="flex items-center gap-3 text-neutral-300">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-300">
                <Phone className="w-4 h-4 text-brand-500 shrink-0" />
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-white transition-colors">
                  {phone.startsWith("Client") ? phone : `Client Concierge: ${phone}`}
                </a>
              </div>
              <div className="flex items-center gap-3 text-neutral-300">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                  WhatsApp: {whatsapp}
                </a>
              </div>
              <div className="flex items-center gap-3 text-neutral-300">
                <Mail className="w-4 h-4 text-brand-500 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-4 text-xs font-mono">
              {fb && (
                <a href={fb} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors uppercase">
                  Facebook
                </a>
              )}
              {insta && (
                <a href={insta} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors uppercase">
                  Instagram
                </a>
              )}
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 transition-colors uppercase">
                WhatsApp
              </a>
            </div>
          </div>

          {/* Collections Column */}
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.25em] text-white uppercase font-bold mb-4 pb-2 border-b border-white/10">
              COLLECTIONS
            </h4>
            <ul className="space-y-2.5 text-xs">
              {footerLinks.collections.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Care Column */}
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.25em] text-white uppercase font-bold mb-4 pb-2 border-b border-white/10">
              CLIENT CARE
            </h4>
            <ul className="space-y-2.5 text-xs">
              {footerLinks.clientCare.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* The Maison Column */}
          <div>
            <h4 className="font-mono text-[10px] tracking-[0.25em] text-white uppercase font-bold mb-4 pb-2 border-b border-white/10">
              THE MAISON
            </h4>
            <ul className="space-y-2.5 text-xs">
              {footerLinks.maison.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-neutral-400">
          <p>© 2026 RISER ATELIER. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              PRIVACY POLICY
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              TERMS OF COUTURE
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-neutral-300">BANGLADESH</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
