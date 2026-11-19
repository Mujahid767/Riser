"use client";

import { useState } from "react";
import type { SiteContent, TrustItem } from "@/lib/cms/types";
import ImagePicker from "@/components/admin/image-picker";

const SECTIONS = [
  ["announcement", "Top bar"],
  ["contact", "Contact & Social"],
  ["hero", "Hero slides"],
  ["categories", "Categories"],
  ["drops", "New & best"],
  ["seasonal", "Spotlight"],
  ["brand", "Brand story"],
  ["trust", "Assurance"],
  ["footer", "Footer"],
] as const;

const ICONS: TrustItem["icon"][] = ["shield", "truck", "returns", "scissors", "clock", "phone"];

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const className =
    "w-full bg-black/40 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white";
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] uppercase tracking-widest text-neutral-500">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className={className} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} className={className} />
      )}
    </label>
  );
}

export default function ContentEditor({ initial }: { initial: SiteContent }) {
  const [content, setContent] = useState(initial);
  const [section, setSection] = useState<(typeof SECTIONS)[number][0]>("announcement");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setError("");
    setStatus("");
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; content?: SiteContent };
    setSaving(false);
    if (!response.ok || !data.content) {
      setError(data.error || "Could not save.");
      return;
    }
    setContent(data.content);
    setStatus("Saved. Refresh the storefront to see it.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Page text</h1>
          <p className="text-neutral-500 text-sm mt-1">
            These words and photos appear on the public homepage, header, and footer.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="bg-white text-black px-5 py-3 text-xs font-bold tracking-[0.18em] uppercase disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
      {status && <p className="text-sm text-emerald-400">{status}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <div className="flex lg:flex-col gap-2 overflow-x-auto">
          {SECTIONS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={`px-4 py-2 text-left text-sm whitespace-nowrap border ${
                section === id
                  ? "bg-white text-black border-white"
                  : "text-neutral-400 border-white/10 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-admin-card border border-admin-border p-5 sm:p-6 space-y-5">
          {section === "announcement" && (
            <>
              <Field
                label="Badge"
                value={content.announcement.badge}
                onChange={(badge) => setContent({ ...content, announcement: { ...content.announcement, badge } })}
              />
              {content.announcement.items.map((item, index) => (
                <Field
                  key={index}
                  label={`Ticker ${index + 1}`}
                  value={item}
                  onChange={(value) => {
                    const items = [...content.announcement.items];
                    items[index] = value;
                    setContent({ ...content, announcement: { ...content.announcement, items } });
                  }}
                />
              ))}
              <Field
                label="Right note"
                value={content.announcement.rightNote}
                onChange={(rightNote) =>
                  setContent({ ...content, announcement: { ...content.announcement, rightNote } })
                }
              />
            </>
          )}

          {section === "contact" && (
            <>
              <div className="bg-brand-500/10 border border-brand-500/20 p-4 text-xs text-brand-300">
                These contact and social media details automatically power the site header, footer, contact page, and floating WhatsApp chat button.
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Customer Care Phone"
                  value={content.contact?.phone ?? ""}
                  onChange={(phone) => setContent({ ...content, contact: { ...content.contact, phone } })}
                />
                <Field
                  label="WhatsApp Business Number"
                  value={content.contact?.whatsapp ?? ""}
                  onChange={(whatsapp) => setContent({ ...content, contact: { ...content.contact, whatsapp } })}
                />
              </div>
              <Field
                label="WhatsApp Default Greeting Message"
                value={content.contact?.whatsappMessage ?? ""}
                onChange={(whatsappMessage) => setContent({ ...content, contact: { ...content.contact, whatsappMessage } })}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Official Email (or Gmail)"
                  value={content.contact?.email ?? ""}
                  onChange={(email) => setContent({ ...content, contact: { ...content.contact, email } })}
                />
                <Field
                  label="Business Hours"
                  value={content.contact?.businessHours ?? ""}
                  onChange={(businessHours) => setContent({ ...content, contact: { ...content.contact, businessHours } })}
                />
              </div>
              <Field
                label="Summary Address Line"
                value={content.contact?.address ?? ""}
                onChange={(address) => setContent({ ...content, contact: { ...content.contact, address } })}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Own Garments Factory Address (English)"
                  value={content.contact?.factoryAddress ?? ""}
                  onChange={(factoryAddress) => setContent({ ...content, contact: { ...content.contact, factoryAddress } })}
                />
                <Field
                  label="Own Garments Factory Address (Bengali)"
                  value={content.contact?.factoryAddressBn ?? ""}
                  onChange={(factoryAddressBn) => setContent({ ...content, contact: { ...content.contact, factoryAddressBn } })}
                />
              </div>
              <div className="pt-2 border-t border-white/10 space-y-4">
                <p className="text-xs font-mono uppercase tracking-wider text-white">Social Media Links</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Facebook Page URL"
                    value={content.contact?.facebook ?? ""}
                    onChange={(facebook) => setContent({ ...content, contact: { ...content.contact, facebook } })}
                  />
                  <Field
                    label="Instagram Profile URL"
                    value={content.contact?.instagram ?? ""}
                    onChange={(instagram) => setContent({ ...content, contact: { ...content.contact, instagram } })}
                  />
                  <Field
                    label="YouTube Channel (Optional)"
                    value={content.contact?.youtube ?? ""}
                    onChange={(youtube) => setContent({ ...content, contact: { ...content.contact, youtube } })}
                  />
                  <Field
                    label="TikTok Profile (Optional)"
                    value={content.contact?.tiktok ?? ""}
                    onChange={(tiktok) => setContent({ ...content, contact: { ...content.contact, tiktok } })}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono uppercase tracking-wider text-white">
                    Retail Outlets ({(content.contact?.outlets ?? []).length})
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const outlets = [...(content.contact?.outlets ?? [])];
                      outlets.push({
                        id: `outlet-${Date.now()}`,
                        mallEn: "New Shopping Complex",
                        mallBn: "নতুন শপিং কমপ্লেক্স",
                        shopEn: "Shop 01 (1st Floor)",
                        shopBn: "০১ (১ম তলা)",
                        area: "Dhaka",
                      });
                      setContent({ ...content, contact: { ...content.contact, outlets } });
                    }}
                    className="text-xs font-mono uppercase px-3 py-1.5 border border-white/20 text-white hover:bg-white/10"
                  >
                    + Add Outlet
                  </button>
                </div>
                {(content.contact?.outlets ?? []).map((outlet, idx) => (
                  <div key={outlet.id || idx} className="border border-white/10 p-4 space-y-3 bg-black/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-brand-400 uppercase">Outlet #{idx + 1}</span>
                      {(content.contact?.outlets ?? []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const outlets = (content.contact?.outlets ?? []).filter((_, i) => i !== idx);
                            setContent({ ...content, contact: { ...content.contact, outlets } });
                          }}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field
                        label="Mall Name (English)"
                        value={outlet.mallEn}
                        onChange={(mallEn) => {
                          const outlets = [...(content.contact?.outlets ?? [])];
                          outlets[idx] = { ...outlet, mallEn };
                          setContent({ ...content, contact: { ...content.contact, outlets } });
                        }}
                      />
                      <Field
                        label="Mall Name (Bengali)"
                        value={outlet.mallBn}
                        onChange={(mallBn) => {
                          const outlets = [...(content.contact?.outlets ?? [])];
                          outlets[idx] = { ...outlet, mallBn };
                          setContent({ ...content, contact: { ...content.contact, outlets } });
                        }}
                      />
                      <Field
                        label="Shop & Floor (English)"
                        value={outlet.shopEn}
                        onChange={(shopEn) => {
                          const outlets = [...(content.contact?.outlets ?? [])];
                          outlets[idx] = { ...outlet, shopEn };
                          setContent({ ...content, contact: { ...content.contact, outlets } });
                        }}
                      />
                      <Field
                        label="Shop & Floor (Bengali)"
                        value={outlet.shopBn}
                        onChange={(shopBn) => {
                          const outlets = [...(content.contact?.outlets ?? [])];
                          outlets[idx] = { ...outlet, shopBn };
                          setContent({ ...content, contact: { ...content.contact, outlets } });
                        }}
                      />
                    </div>
                    <Field
                      label="Area / City"
                      value={outlet.area}
                      onChange={(area) => {
                        const outlets = [...(content.contact?.outlets ?? [])];
                        outlets[idx] = { ...outlet, area };
                        setContent({ ...content, contact: { ...content.contact, outlets } });
                      }}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {section === "hero" &&
            content.hero.map((slide, index) => (
              <div key={slide.id} className="space-y-4 border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold">Slide {index + 1}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-xs text-neutral-400"
                      disabled={index === 0}
                      onClick={() => {
                        const hero = [...content.hero];
                        [hero[index - 1], hero[index]] = [hero[index], hero[index - 1]];
                        setContent({ ...content, hero });
                      }}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="text-xs text-neutral-400"
                      disabled={index === content.hero.length - 1}
                      onClick={() => {
                        const hero = [...content.hero];
                        [hero[index + 1], hero[index]] = [hero[index], hero[index + 1]];
                        setContent({ ...content, hero });
                      }}
                    >
                      Down
                    </button>
                  </div>
                </div>
                <ImagePicker
                  label="Photo"
                  value={slide.image}
                  onChange={(image) => {
                    const hero = [...content.hero];
                    hero[index] = { ...slide, image };
                    setContent({ ...content, hero });
                  }}
                />
                <Field label="Tagline" value={slide.tagline} onChange={(tagline) => updateSlide(index, { tagline })} />
                <Field
                  label="Headline (use a new line for the second line)"
                  value={slide.headline}
                  onChange={(headline) => updateSlide(index, { headline })}
                  multiline
                />
                <Field
                  label="Subheading"
                  value={slide.subheading}
                  onChange={(subheading) => updateSlide(index, { subheading })}
                  multiline
                />
                <Field
                  label="Featured label"
                  value={slide.categoryHighlight}
                  onChange={(categoryHighlight) => updateSlide(index, { categoryHighlight })}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Button 1" value={slide.cta1Label} onChange={(cta1Label) => updateSlide(index, { cta1Label })} />
                  <Field label="Button 1 link" value={slide.cta1Href} onChange={(cta1Href) => updateSlide(index, { cta1Href })} />
                  <Field label="Button 2" value={slide.cta2Label} onChange={(cta2Label) => updateSlide(index, { cta2Label })} />
                  <Field label="Button 2 link" value={slide.cta2Href} onChange={(cta2Href) => updateSlide(index, { cta2Href })} />
                </div>
                {slide.specs.map((spec, specIndex) => (
                  <Field
                    key={specIndex}
                    label={`Spec ${specIndex + 1}`}
                    value={spec}
                    onChange={(value) => {
                      const specs = [...slide.specs];
                      specs[specIndex] = value;
                      updateSlide(index, { specs });
                    }}
                  />
                ))}
              </div>
            ))}

          {section === "categories" && (
            <>
              <Field
                label="Eyebrow"
                value={content.categories.eyebrow}
                onChange={(eyebrow) => setContent({ ...content, categories: { ...content.categories, eyebrow } })}
              />
              <Field
                label="Title"
                value={content.categories.title}
                onChange={(title) => setContent({ ...content, categories: { ...content.categories, title } })}
              />
              <Field
                label="Right line"
                value={content.categories.rightLine1}
                onChange={(rightLine1) =>
                  setContent({ ...content, categories: { ...content.categories, rightLine1 } })
                }
              />
              <Field
                label="Right subline"
                value={content.categories.rightLine2}
                onChange={(rightLine2) =>
                  setContent({ ...content, categories: { ...content.categories, rightLine2 } })
                }
              />
              <Field
                label="Archive button"
                value={content.categories.archiveLabel}
                onChange={(archiveLabel) =>
                  setContent({ ...content, categories: { ...content.categories, archiveLabel } })
                }
              />
              {content.categories.cards.map((card, index) => (
                <div key={card.id} className="space-y-4 border border-white/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-white font-semibold">{card.label}</p>
                    <label className="inline-flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!card.hidden}
                        onChange={(e) => updateCard(index, { hidden: !e.target.checked })}
                        className="accent-white"
                      />
                      Show on homepage
                    </label>
                  </div>
                  <ImagePicker
                    label="Photo"
                    value={card.image}
                    onChange={(image) => updateCard(index, { image })}
                  />
                  <Field label="Name" value={card.label} onChange={(label) => updateCard(index, { label })} />
                  <Field label="Eyebrow" value={card.eyebrow} onChange={(eyebrow) => updateCard(index, { eyebrow })} />
                  <Field
                    label="Description"
                    value={card.description}
                    onChange={(description) => updateCard(index, { description })}
                    multiline
                  />
                  <Field label="Edition" value={card.edition} onChange={(edition) => updateCard(index, { edition })} />
                  <Field label="Shop slug" value={card.slug} onChange={(slug) => updateCard(index, { slug })} />
                </div>
              ))}
            </>
          )}

          {section === "drops" && (
            <>
              <Field label="New arrivals eyebrow" value={content.newArrivals.eyebrow} onChange={(eyebrow) => setContent({ ...content, newArrivals: { ...content.newArrivals, eyebrow } })} />
              <Field label="New arrivals title" value={content.newArrivals.title} onChange={(title) => setContent({ ...content, newArrivals: { ...content.newArrivals, title } })} />
              <Field label="New arrivals link" value={content.newArrivals.linkLabel} onChange={(linkLabel) => setContent({ ...content, newArrivals: { ...content.newArrivals, linkLabel } })} />
              <Field label="Bespoke eyebrow" value={content.newArrivals.bannerEyebrow} onChange={(bannerEyebrow) => setContent({ ...content, newArrivals: { ...content.newArrivals, bannerEyebrow } })} />
              <Field label="Bespoke title" value={content.newArrivals.bannerTitle} onChange={(bannerTitle) => setContent({ ...content, newArrivals: { ...content.newArrivals, bannerTitle } })} />
              <Field label="Bespoke text" value={content.newArrivals.bannerBody} onChange={(bannerBody) => setContent({ ...content, newArrivals: { ...content.newArrivals, bannerBody } })} multiline />
              <Field label="Bespoke button" value={content.newArrivals.bannerCta} onChange={(bannerCta) => setContent({ ...content, newArrivals: { ...content.newArrivals, bannerCta } })} />
              <Field label="Best sellers eyebrow" value={content.bestSellers.eyebrow} onChange={(eyebrow) => setContent({ ...content, bestSellers: { ...content.bestSellers, eyebrow } })} />
              <Field label="Best sellers title" value={content.bestSellers.title} onChange={(title) => setContent({ ...content, bestSellers: { ...content.bestSellers, title } })} />
              <Field label="Best sellers link" value={content.bestSellers.linkLabel} onChange={(linkLabel) => setContent({ ...content, bestSellers: { ...content.bestSellers, linkLabel } })} />
            </>
          )}

          {section === "seasonal" && (
            <>
              <ImagePicker
                label="Photo"
                value={content.seasonal.image}
                onChange={(image) => setContent({ ...content, seasonal: { ...content.seasonal, image } })}
              />
              <Field label="Badge" value={content.seasonal.badge} onChange={(badge) => setContent({ ...content, seasonal: { ...content.seasonal, badge } })} />
              <Field label="Title line 1" value={content.seasonal.titleLine1} onChange={(titleLine1) => setContent({ ...content, seasonal: { ...content.seasonal, titleLine1 } })} />
              <Field label="Title line 2" value={content.seasonal.titleLine2} onChange={(titleLine2) => setContent({ ...content, seasonal: { ...content.seasonal, titleLine2 } })} />
              <Field label="Body" value={content.seasonal.body} onChange={(body) => setContent({ ...content, seasonal: { ...content.seasonal, body } })} multiline />
              {content.seasonal.specs.map((spec, index) => (
                <div key={index} className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label={`Spec ${index + 1} label`}
                    value={spec.label}
                    onChange={(label) => {
                      const specs = [...content.seasonal.specs];
                      specs[index] = { ...spec, label };
                      setContent({ ...content, seasonal: { ...content.seasonal, specs } });
                    }}
                  />
                  <Field
                    label={`Spec ${index + 1} value`}
                    value={spec.value}
                    onChange={(value) => {
                      const specs = [...content.seasonal.specs];
                      specs[index] = { ...spec, value };
                      setContent({ ...content, seasonal: { ...content.seasonal, specs } });
                    }}
                  />
                </div>
              ))}
              <Field label="Button 1" value={content.seasonal.cta1Label} onChange={(cta1Label) => setContent({ ...content, seasonal: { ...content.seasonal, cta1Label } })} />
              <Field label="Button 1 link" value={content.seasonal.cta1Href} onChange={(cta1Href) => setContent({ ...content, seasonal: { ...content.seasonal, cta1Href } })} />
              <Field label="Button 2" value={content.seasonal.cta2Label} onChange={(cta2Label) => setContent({ ...content, seasonal: { ...content.seasonal, cta2Label } })} />
              <Field label="Button 2 link" value={content.seasonal.cta2Href} onChange={(cta2Href) => setContent({ ...content, seasonal: { ...content.seasonal, cta2Href } })} />
              <Field label="Photo caption" value={content.seasonal.archiveLabel} onChange={(archiveLabel) => setContent({ ...content, seasonal: { ...content.seasonal, archiveLabel } })} />
              <Field label="Reference" value={content.seasonal.archiveRef} onChange={(archiveRef) => setContent({ ...content, seasonal: { ...content.seasonal, archiveRef } })} />
            </>
          )}

          {section === "brand" && (
            <>
              <ImagePicker
                label="Photo"
                value={content.brand.image}
                onChange={(image) => setContent({ ...content, brand: { ...content.brand, image } })}
              />
              <Field label="Heritage label" value={content.brand.heritageLabel} onChange={(heritageLabel) => setContent({ ...content, brand: { ...content.brand, heritageLabel } })} />
              <Field label="Established" value={content.brand.established} onChange={(established) => setContent({ ...content, brand: { ...content.brand, established } })} />
              <Field label="Badge left" value={content.brand.badgeLeft} onChange={(badgeLeft) => setContent({ ...content, brand: { ...content.brand, badgeLeft } })} />
              <Field label="Badge right" value={content.brand.badgeRight} onChange={(badgeRight) => setContent({ ...content, brand: { ...content.brand, badgeRight } })} />
              <Field label="Eyebrow" value={content.brand.eyebrow} onChange={(eyebrow) => setContent({ ...content, brand: { ...content.brand, eyebrow } })} />
              <Field label="Title line 1" value={content.brand.titleLine1} onChange={(titleLine1) => setContent({ ...content, brand: { ...content.brand, titleLine1 } })} />
              <Field label="Title line 2" value={content.brand.titleLine2} onChange={(titleLine2) => setContent({ ...content, brand: { ...content.brand, titleLine2 } })} />
              <Field label="Paragraph 1" value={content.brand.paragraph1} onChange={(paragraph1) => setContent({ ...content, brand: { ...content.brand, paragraph1 } })} multiline />
              <Field label="Paragraph 2" value={content.brand.paragraph2} onChange={(paragraph2) => setContent({ ...content, brand: { ...content.brand, paragraph2 } })} multiline />
              {content.brand.stats.map((stat, index) => (
                <div key={index} className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label={`Stat ${index + 1} value`}
                    value={stat.value}
                    onChange={(value) => {
                      const stats = [...content.brand.stats];
                      stats[index] = { ...stat, value };
                      setContent({ ...content, brand: { ...content.brand, stats } });
                    }}
                  />
                  <Field
                    label={`Stat ${index + 1} label`}
                    value={stat.label}
                    onChange={(label) => {
                      const stats = [...content.brand.stats];
                      stats[index] = { ...stat, label };
                      setContent({ ...content, brand: { ...content.brand, stats } });
                    }}
                  />
                </div>
              ))}
              <Field label="Button" value={content.brand.ctaLabel} onChange={(ctaLabel) => setContent({ ...content, brand: { ...content.brand, ctaLabel } })} />
              <Field label="Button link" value={content.brand.ctaHref} onChange={(ctaHref) => setContent({ ...content, brand: { ...content.brand, ctaHref } })} />
            </>
          )}

          {section === "trust" && (
            <>
              <Field label="Eyebrow" value={content.trust.eyebrow} onChange={(eyebrow) => setContent({ ...content, trust: { ...content.trust, eyebrow } })} />
              <Field label="Title" value={content.trust.title} onChange={(title) => setContent({ ...content, trust: { ...content.trust, title } })} />
              <Field label="Subtitle" value={content.trust.subtitle} onChange={(subtitle) => setContent({ ...content, trust: { ...content.trust, subtitle } })} multiline />
              {content.trust.items.map((item, index) => (
                <div key={index} className="space-y-3 border border-white/10 p-4">
                  <label className="block space-y-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500">Icon</span>
                    <select
                      value={item.icon}
                      onChange={(event) => {
                        const items = [...content.trust.items];
                        items[index] = { ...item, icon: event.target.value as TrustItem["icon"] };
                        setContent({ ...content, trust: { ...content.trust, items } });
                      }}
                      className="w-full bg-black/40 border border-white/10 px-3 py-2 text-sm text-white"
                    >
                      {ICONS.map((icon) => (
                        <option key={icon} value={icon}>
                          {icon}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field
                    label="Title"
                    value={item.title}
                    onChange={(title) => {
                      const items = [...content.trust.items];
                      items[index] = { ...item, title };
                      setContent({ ...content, trust: { ...content.trust, items } });
                    }}
                  />
                  <Field
                    label="Description"
                    value={item.desc}
                    onChange={(desc) => {
                      const items = [...content.trust.items];
                      items[index] = { ...item, desc };
                      setContent({ ...content, trust: { ...content.trust, items } });
                    }}
                    multiline
                  />
                </div>
              ))}
            </>
          )}

          {section === "footer" && (
            <>
              <Field label="Newsletter eyebrow" value={content.footer.newsletterEyebrow} onChange={(newsletterEyebrow) => setContent({ ...content, footer: { ...content.footer, newsletterEyebrow } })} />
              <Field label="Newsletter title" value={content.footer.newsletterTitle} onChange={(newsletterTitle) => setContent({ ...content, footer: { ...content.footer, newsletterTitle } })} />
              <Field label="Newsletter text" value={content.footer.newsletterBody} onChange={(newsletterBody) => setContent({ ...content, footer: { ...content.footer, newsletterBody } })} multiline />
              <Field label="Brand text" value={content.footer.brandBlurb} onChange={(brandBlurb) => setContent({ ...content, footer: { ...content.footer, brandBlurb } })} multiline />
              <Field label="Address" value={content.footer.address} onChange={(address) => setContent({ ...content, footer: { ...content.footer, address } })} />
              <Field label="Phone" value={content.footer.phone} onChange={(phone) => setContent({ ...content, footer: { ...content.footer, phone } })} />
              <Field label="Email" value={content.footer.email} onChange={(email) => setContent({ ...content, footer: { ...content.footer, email } })} />
            </>
          )}
        </div>
      </div>
    </div>
  );

  function updateSlide(index: number, patch: Partial<SiteContent["hero"][number]>) {
    const hero = [...content.hero];
    hero[index] = { ...hero[index], ...patch };
    setContent({ ...content, hero });
  }

  function updateCard(index: number, patch: Partial<SiteContent["categories"]["cards"][number]>) {
    const cards = [...content.categories.cards];
    cards[index] = { ...cards[index], ...patch };
    setContent({ ...content, categories: { ...content.categories, cards } });
  }
}
