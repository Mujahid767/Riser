"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  Clock,
  MessageCircle,
  CheckCircle2,
  Factory,
  Building2,
  Globe,
  ExternalLink,
} from "lucide-react";
import type { SiteContent } from "@/lib/cms/types";

export default function ContactClient({ content }: { content: SiteContent }) {
  const phone = content.contact?.phone || "+880 1577-049566";
  const whatsapp = content.contact?.whatsapp || "01577049566";
  const email = content.contact?.email || "riserclothingshop@gmail.com";
  const factoryEn = content.contact?.factoryAddress || "Mahmudpur, Signboard, Narayanganj, Bangladesh";
  const factoryBn = content.contact?.factoryAddressBn || "মাহমুদপুর, সাইনবোর্ড, নারায়ণগঞ্জ";
  const hours =
    content.contact?.businessHours ||
    "Sat–Thu, 10:00 AM – 9:00 PM (Factory & Export Desk Open for International Buyers)";
  const facebook = content.contact?.facebook || "https://www.facebook.com/profile.php?id=61571749063384";
  const outlets = content.contact?.outlets ?? [];

  const waDigits = whatsapp.replace(/\D/g, "");
  const waNumber = waDigits.startsWith("88") ? waDigits : `88${waDigits}`;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    content.contact?.whatsappMessage || "Hello Riser, I would like to inquire about ordering from your collection."
  )}`;

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    country: "",
    subject: "Retail order inquiry",
    message: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = [
      `Hello Riser (${form.subject})`,
      `Name: ${form.name}`,
      `Phone/WhatsApp: ${form.phone}`,
      form.country ? `Country/City: ${form.country}` : "",
      `Message: ${form.message}`,
    ]
      .filter(Boolean)
      .join("\n");
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  }

  const contactItems = [
    {
      icon: Phone,
      label: "Direct Phone & International Hotline",
      value: phone,
      href: `tel:${phone.replace(/[\s-]/g, "")}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp Business (24/7 Domestic & Foreign Orders)",
      value: `${phone} — Click to Open WhatsApp`,
      href: waUrl,
    },
    {
      icon: Mail,
      label: "Official Email (Retail & Export Desk)",
      value: email,
      href: `mailto:${email}`,
    },
    {
      icon: Globe,
      label: "Official Facebook Page",
      value: "facebook.com/RiserClothing (Click to Visit)",
      href: facebook,
    },
    {
      icon: Factory,
      label: "Own Garments & Manufacturing Plant",
      value: `${factoryEn} (${factoryBn})`,
      href: null,
    },
    {
      icon: Clock,
      label: "Business Hours",
      value: hours,
      href: null,
    },
  ];

  return (
    <div className="bg-white min-h-screen text-neutral-900">
      {/* Header Banner */}
      <div className="bg-[#08080d] text-white border-b border-white/10">
        <div className="container-store py-14">
          <span className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-brand-400 mb-3">
            <Factory className="w-3.5 h-3.5" /> 100% Own Garments Manufacturer • {outlets.length} Outlets in Dhaka
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-wide">
            Contact Our Factory, Showrooms &amp; Export Desk
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-2xl">
            Every Riser dress is crafted in our own garments factory at{" "}
            <strong className="text-white">{factoryEn}</strong>. Reach us directly for retail orders, sizing advice, or international wholesale &amp; overseas delivery.
          </p>
        </div>
      </div>

      <div className="container-store py-12 space-y-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Direct Channels */}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-6 uppercase tracking-wide">
              Direct Contact Channels
            </h2>
            <div className="space-y-3.5">
              {contactItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-neutral-200 hover:border-neutral-400 transition-colors"
                >
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-brand-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-500 font-medium mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-neutral-900 font-semibold hover:text-brand-600 transition-colors text-sm inline-flex items-center gap-1 break-all"
                      >
                        {item.value}
                        {item.href.startsWith("http") && <ExternalLink className="w-3.5 h-3.5 shrink-0" />}
                      </a>
                    ) : (
                      <p className="text-neutral-900 font-semibold text-sm">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* International & Wholesale Buyer Highlight */}
            <div className="mt-6 p-6 rounded-2xl bg-emerald-950 text-white border border-emerald-700 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-emerald-300 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4" /> International &amp; Wholesale Buyers Desk
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                  Direct Factory Export
                </span>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Ordering from the USA, UK, Canada, UAE, Europe, Malaysia, or anywhere abroad? All Riser garments are produced in our own factory at{" "}
                <strong>{factoryEn}</strong>. Contact us on WhatsApp or Gmail for single-piece international shipping or bulk boutique orders.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold tracking-wider uppercase transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp: {phone}
                </a>
                <a
                  href={`mailto:${email}?subject=${encodeURIComponent("International / Wholesale Inquiry — Riser")}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wider transition-colors"
                >
                  <Mail className="w-4 h-4" /> {email}
                </a>
              </div>
            </div>
          </div>

          {/* Right: Inquiry Form (forwards directly to WhatsApp / Email) */}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2 uppercase tracking-wide">
              Send Us an Inquiry
            </h2>
            <p className="text-xs text-neutral-500 mb-6">
              Fill out the form below — clicking send opens your inquiry directly with our team on WhatsApp ({phone}).
            </p>
            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-emerald-950">
                  Your inquiry is ready on WhatsApp!
                </h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  If WhatsApp did not open automatically, click the button below or email us at{" "}
                  <a href={`mailto:${email}`} className="underline font-semibold">
                    {email}
                  </a>
                  .
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                  >
                    Open WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2.5 rounded-xl border border-emerald-300 text-emerald-900 text-xs font-semibold"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form className="space-y-4 p-6 rounded-2xl border border-neutral-200 bg-neutral-50/60" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+880 1XXX-XXXXXX"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-country" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                      City / Country
                    </label>
                    <input
                      id="contact-country"
                      type="text"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      placeholder="e.g. Dhaka, London, New York, Dubai"
                      className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Inquiry Type
                  </label>
                  <select
                    id="contact-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  >
                    <option>Retail order inquiry</option>
                    <option>International / Foreign buyer order</option>
                    <option>Wholesale / Bulk garments export inquiry</option>
                    <option>Product &amp; size measurement question</option>
                    <option>Return / Exchange</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us the dress name, size (16–38), quantity, or destination country…"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Send Inquiry via WhatsApp
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Full Directory of 7 Retail Outlets + Own Factory */}
        <div className="pt-8 border-t border-neutral-200 space-y-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-brand-600 font-bold">
              VISIT US IN PERSON • DHAKA &amp; NARAYANGANJ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 uppercase mt-1">
              Our {outlets.length} Retail Outlets in Dhaka &amp; Garments Factory
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Factory Card */}
            <div className="rounded-2xl border-2 border-neutral-900 bg-neutral-900 text-white p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-brand-400 mb-2">
                  <span>OWN GARMENTS FACTORY</span>
                  <Factory className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold leading-snug">Riser Garments Manufacturing Unit</h3>
                <p className="text-xs text-neutral-200 mt-1.5">{factoryEn}</p>
                <p className="text-xs text-neutral-300 mt-0.5">🏭 {factoryBn}</p>
              </div>
              <p className="text-[11px] font-mono text-emerald-400 mt-4 pt-3 border-t border-white/15">
                ✓ 100% In-House Production
              </p>
            </div>

            {outlets.map((o, idx) => (
              <div
                key={o.id || idx}
                className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-5 flex flex-col justify-between hover:border-neutral-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
                    <span>OUTLET 0{idx + 1}</span>
                    <Building2 className="w-3.5 h-3.5 text-brand-500" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 leading-snug">{o.mallEn}</h3>
                  <p className="text-xs text-neutral-700 mt-0.5">🏬 {o.mallBn}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-200 text-xs font-mono space-y-0.5">
                  <p className="font-bold text-brand-600">{o.shopEn}</p>
                  <p className="text-neutral-600">
                    {o.shopBn} • {o.area}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
