export type HeroSlide = {
  id: string;
  image: string;
  tagline: string;
  headline: string;
  subheading: string;
  categoryHighlight: string;
  cta1Label: string;
  cta1Href: string;
  cta2Label: string;
  cta2Href: string;
  specs: string[];
};

export type CategoryCard = {
  id: string;
  slug: string;
  label: string;
  eyebrow: string;
  description: string;
  image: string;
  edition: string;
  featured: boolean;
};

export type TrustItem = {
  icon: "shield" | "truck" | "returns" | "scissors" | "clock" | "phone";
  title: string;
  desc: string;
};

export type SiteContent = {
  announcement: {
    badge: string;
    items: string[];
    rightNote: string;
  };
  hero: HeroSlide[];
  categories: {
    eyebrow: string;
    title: string;
    rightLine1: string;
    rightLine2: string;
    archiveLabel: string;
    cards: CategoryCard[];
  };
  newArrivals: {
    eyebrow: string;
    title: string;
    linkLabel: string;
    bannerEyebrow: string;
    bannerTitle: string;
    bannerBody: string;
    bannerCta: string;
  };
  bestSellers: {
    eyebrow: string;
    title: string;
    linkLabel: string;
  };
  seasonal: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    body: string;
    specs: { label: string; value: string }[];
    cta1Label: string;
    cta1Href: string;
    cta2Label: string;
    cta2Href: string;
    image: string;
    imageAlt: string;
    archiveLabel: string;
    archiveRef: string;
  };
  brand: {
    image: string;
    imageAlt: string;
    heritageLabel: string;
    established: string;
    badgeLeft: string;
    badgeRight: string;
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    paragraph1: string;
    paragraph2: string;
    stats: { value: string; label: string }[];
    ctaLabel: string;
    ctaHref: string;
  };
  trust: {
    eyebrow: string;
    title: string;
    subtitle: string;
    items: TrustItem[];
  };
  footer: {
    newsletterEyebrow: string;
    newsletterTitle: string;
    newsletterBody: string;
    brandBlurb: string;
    address: string;
    phone: string;
    email: string;
  };
};

export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
};

export type CmsStore = {
  content: SiteContent;
  media: MediaItem[];
};
