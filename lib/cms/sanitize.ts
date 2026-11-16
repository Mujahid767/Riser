import { defaultSiteContent } from "./defaults";
import type { CategoryCard, HeroSlide, SiteContent, TrustItem } from "./types";

const TRUST_ICONS = new Set<TrustItem["icon"]>([
  "shield",
  "truck",
  "returns",
  "scissors",
  "clock",
  "phone",
]);

function text(value: unknown, fallback: string, max = 600): string {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[<>]/g, "").trim();
  if (!cleaned) return fallback;
  return cleaned.slice(0, max);
}

function optionalText(value: unknown, fallback: string, max = 600): string {
  if (typeof value !== "string") return fallback;
  return value.replace(/[<>]/g, "").slice(0, max);
}

function image(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const url = value.trim();
  if (url.length > 800) return fallback;
  if (url.startsWith("/uploads/") && /^\/uploads\/[a-zA-Z0-9._/-]+$/.test(url)) return url;
  if (/^https:\/\/[^\s]+$/.test(url)) return url;
  return fallback;
}

function href(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const url = value.trim();
  if (url.startsWith("/") && !url.startsWith("//") && url.length < 300) return url;
  if (/^https:\/\/[^\s]+$/.test(url) && url.length < 300) return url;
  return fallback;
}

function slug(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 80);
  return cleaned || fallback;
}

export function sanitizeContent(input: unknown): SiteContent {
  const source = (input && typeof input === "object" ? input : {}) as Partial<SiteContent>;
  const base = defaultSiteContent;

  const heroInput = Array.isArray(source.hero) ? source.hero : base.hero;
  const hero: HeroSlide[] = heroInput.slice(0, 8).map((slide, index) => {
    const fallback = base.hero[index] ?? base.hero[0];
    const raw = (slide ?? {}) as Partial<HeroSlide>;
    const specs = Array.isArray(raw.specs) ? raw.specs : fallback.specs;
    return {
      id: text(raw.id, fallback.id, 40),
      image: image(raw.image, fallback.image),
      tagline: text(raw.tagline, fallback.tagline, 80),
      headline: optionalText(raw.headline, fallback.headline, 120),
      subheading: text(raw.subheading, fallback.subheading, 400),
      categoryHighlight: text(raw.categoryHighlight, fallback.categoryHighlight, 80),
      cta1Label: text(raw.cta1Label, fallback.cta1Label, 40),
      cta1Href: href(raw.cta1Href, fallback.cta1Href),
      cta2Label: text(raw.cta2Label, fallback.cta2Label, 40),
      cta2Href: href(raw.cta2Href, fallback.cta2Href),
      specs: [0, 1, 2].map((i) => text(specs[i], fallback.specs[i] ?? "", 80)),
    };
  });

  const cardsInput = Array.isArray(source.categories?.cards)
    ? source.categories.cards
    : base.categories.cards;
  const cards: CategoryCard[] = cardsInput.slice(0, 16).map((card, index) => {
    const fallback = base.categories.cards[index] ?? base.categories.cards[0];
    const raw = (card ?? {}) as Partial<CategoryCard>;
    return {
      id: text(raw.id, fallback.id, 40),
      slug: slug(raw.slug, fallback.slug),
      label: text(raw.label, fallback.label, 80),
      eyebrow: text(raw.eyebrow, fallback.eyebrow, 80),
      description: text(raw.description, fallback.description, 240),
      image: image(raw.image, fallback.image),
      edition: text(raw.edition, fallback.edition, 40),
      featured: Boolean(raw.featured),
    };
  });

  const trustInput = Array.isArray(source.trust?.items) ? source.trust.items : base.trust.items;
  const trustItems: TrustItem[] = trustInput.slice(0, 8).map((item, index) => {
    const fallback = base.trust.items[index] ?? base.trust.items[0];
    const raw = (item ?? {}) as Partial<TrustItem>;
    const icon = TRUST_ICONS.has(raw.icon as TrustItem["icon"])
      ? (raw.icon as TrustItem["icon"])
      : fallback.icon;
    return {
      icon,
      title: text(raw.title, fallback.title, 80),
      desc: text(raw.desc, fallback.desc, 240),
    };
  });

  const seasonalSpecs = Array.isArray(source.seasonal?.specs)
    ? source.seasonal.specs
    : base.seasonal.specs;
  const brandStats = Array.isArray(source.brand?.stats) ? source.brand.stats : base.brand.stats;

  return {
    announcement: {
      badge: text(source.announcement?.badge, base.announcement.badge, 80),
      items: (Array.isArray(source.announcement?.items)
        ? source.announcement.items
        : base.announcement.items
      )
        .slice(0, 6)
        .map((item, index) => text(item, base.announcement.items[index] ?? "RISER", 40)),
      rightNote: text(source.announcement?.rightNote, base.announcement.rightNote, 80),
    },
    contact: {
      phone: text(source.contact?.phone, base.contact.phone, 30),
      whatsapp: text(source.contact?.whatsapp, base.contact.whatsapp, 30),
      email: text(source.contact?.email, base.contact.email, 100),
      address: text(source.contact?.address, base.contact.address, 200),
      businessHours: text(source.contact?.businessHours, base.contact.businessHours, 100),
      facebook: href(source.contact?.facebook, base.contact.facebook),
      instagram: href(source.contact?.instagram, base.contact.instagram),
      youtube: optionalText(source.contact?.youtube, base.contact.youtube ?? "", 200),
      tiktok: optionalText(source.contact?.tiktok, base.contact.tiktok ?? "", 200),
      whatsappMessage: text(source.contact?.whatsappMessage, base.contact.whatsappMessage, 300),
    },
    hero: hero.length ? hero : base.hero,
    categories: {
      eyebrow: text(source.categories?.eyebrow, base.categories.eyebrow, 80),
      title: text(source.categories?.title, base.categories.title, 80),
      rightLine1: text(source.categories?.rightLine1, base.categories.rightLine1, 80),
      rightLine2: text(source.categories?.rightLine2, base.categories.rightLine2, 80),
      archiveLabel: text(source.categories?.archiveLabel, base.categories.archiveLabel, 80),
      cards: cards.length ? cards : base.categories.cards,
    },
    newArrivals: {
      eyebrow: text(source.newArrivals?.eyebrow, base.newArrivals.eyebrow, 80),
      title: text(source.newArrivals?.title, base.newArrivals.title, 80),
      linkLabel: text(source.newArrivals?.linkLabel, base.newArrivals.linkLabel, 80),
      bannerEyebrow: text(source.newArrivals?.bannerEyebrow, base.newArrivals.bannerEyebrow, 80),
      bannerTitle: text(source.newArrivals?.bannerTitle, base.newArrivals.bannerTitle, 140),
      bannerBody: text(source.newArrivals?.bannerBody, base.newArrivals.bannerBody, 300),
      bannerCta: text(source.newArrivals?.bannerCta, base.newArrivals.bannerCta, 40),
    },
    bestSellers: {
      eyebrow: text(source.bestSellers?.eyebrow, base.bestSellers.eyebrow, 80),
      title: text(source.bestSellers?.title, base.bestSellers.title, 80),
      linkLabel: text(source.bestSellers?.linkLabel, base.bestSellers.linkLabel, 80),
    },
    seasonal: {
      badge: text(source.seasonal?.badge, base.seasonal.badge, 80),
      titleLine1: text(source.seasonal?.titleLine1, base.seasonal.titleLine1, 80),
      titleLine2: text(source.seasonal?.titleLine2, base.seasonal.titleLine2, 80),
      body: text(source.seasonal?.body, base.seasonal.body, 500),
      specs: [0, 1, 2].map((i) => ({
        label: text(seasonalSpecs[i]?.label, base.seasonal.specs[i].label, 40),
        value: text(seasonalSpecs[i]?.value, base.seasonal.specs[i].value, 40),
      })),
      cta1Label: text(source.seasonal?.cta1Label, base.seasonal.cta1Label, 40),
      cta1Href: href(source.seasonal?.cta1Href, base.seasonal.cta1Href),
      cta2Label: text(source.seasonal?.cta2Label, base.seasonal.cta2Label, 40),
      cta2Href: href(source.seasonal?.cta2Href, base.seasonal.cta2Href),
      image: image(source.seasonal?.image, base.seasonal.image),
      imageAlt: text(source.seasonal?.imageAlt, base.seasonal.imageAlt, 120),
      archiveLabel: text(source.seasonal?.archiveLabel, base.seasonal.archiveLabel, 40),
      archiveRef: text(source.seasonal?.archiveRef, base.seasonal.archiveRef, 40),
    },
    brand: {
      image: image(source.brand?.image, base.brand.image),
      imageAlt: text(source.brand?.imageAlt, base.brand.imageAlt, 120),
      heritageLabel: text(source.brand?.heritageLabel, base.brand.heritageLabel, 40),
      established: text(source.brand?.established, base.brand.established, 40),
      badgeLeft: text(source.brand?.badgeLeft, base.brand.badgeLeft, 60),
      badgeRight: text(source.brand?.badgeRight, base.brand.badgeRight, 60),
      eyebrow: text(source.brand?.eyebrow, base.brand.eyebrow, 80),
      titleLine1: text(source.brand?.titleLine1, base.brand.titleLine1, 80),
      titleLine2: text(source.brand?.titleLine2, base.brand.titleLine2, 80),
      paragraph1: text(source.brand?.paragraph1, base.brand.paragraph1, 700),
      paragraph2: text(source.brand?.paragraph2, base.brand.paragraph2, 700),
      stats: [0, 1, 2].map((i) => ({
        value: text(brandStats[i]?.value, base.brand.stats[i].value, 12),
        label: text(brandStats[i]?.label, base.brand.stats[i].label, 40),
      })),
      ctaLabel: text(source.brand?.ctaLabel, base.brand.ctaLabel, 60),
      ctaHref: href(source.brand?.ctaHref, base.brand.ctaHref),
    },
    trust: {
      eyebrow: text(source.trust?.eyebrow, base.trust.eyebrow, 80),
      title: text(source.trust?.title, base.trust.title, 80),
      subtitle: text(source.trust?.subtitle, base.trust.subtitle, 240),
      items: trustItems.length ? trustItems : base.trust.items,
    },
    footer: {
      newsletterEyebrow: text(
        source.footer?.newsletterEyebrow,
        base.footer.newsletterEyebrow,
        80
      ),
      newsletterTitle: text(source.footer?.newsletterTitle, base.footer.newsletterTitle, 80),
      newsletterBody: text(source.footer?.newsletterBody, base.footer.newsletterBody, 300),
      brandBlurb: text(source.footer?.brandBlurb, base.footer.brandBlurb, 500),
      address: text(source.footer?.address, base.footer.address, 160),
      phone: text(source.footer?.phone, base.footer.phone, 80),
      email: text(source.footer?.email, base.footer.email, 80),
    },
  };
}
