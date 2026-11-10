import type { SiteContent } from "./types";

export const defaultSiteContent: SiteContent = {
  announcement: {
    badge: "DROP NOCTURNE // EDITION 2026",
    items: ["NAYRA CUT & SKIRT", "ROYAL BABY FROCKS", "TWO & THREE PIECE", "SHORT TOPS"],
    rightNote: "DHAKA & NATIONWIDE DISPATCH",
  },
  hero: [
    {
      id: "slide-nayra",
      image:
        "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1920&q=85",
      tagline: "EDITION 01 // DROP NOCTURNE",
      headline: "UNAPOLOGETIC\nLUXURY.",
      subheading:
        "The Signature Nayra Cut Kurti paired with voluminous circular flare skirts. Hand-beaten gold zari on raw mulberry silk.",
      categoryHighlight: "NAYRA DRESS WITH SKIRT",
      cta1Label: "EXPLORE THE DROP",
      cta1Href: "/shop?category=nayra-dress-skirt",
      cta2Label: "ALL COLLECTIONS",
      cta2Href: "/shop",
      specs: [
        "FABRIC: RAW MULBERRY SILK",
        "CRAFT: HAND ZARI EMBROIDERY",
        "SERIES: LIMITED 50 PIECES",
      ],
    },
    {
      id: "slide-baby",
      image:
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1920&q=85",
      tagline: "PETITE ATELIER // HEIRLOOM LINE",
      headline: "ROYAL BABY\nFROCKS & SUITS.",
      subheading:
        "Crafted for little princesses. Plush micro-velvet, pure French lace, and heirloom pearls with hypoallergenic organic cotton linings.",
      categoryHighlight: "BABY FROCKS & TWO-PIECE",
      cta1Label: "DISCOVER BABY FROCKS",
      cta1Href: "/shop?category=baby-frock",
      cta2Label: "KIDS TWO & THREE PIECE",
      cta2Href: "/shop?category=two-piece-kids",
      specs: [
        "AGE: 0 MONTHS – 12 YEARS",
        "FABRIC: FRENCH LACE & TULLE",
        "SAFETY: HYPOALLERGENIC",
      ],
    },
    {
      id: "slide-adult",
      image:
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1920&q=85",
      tagline: "MAISON FEMME // CONTEMPORARY COUTURE",
      headline: "ARCHITECTURAL\nSILHOUETTES.",
      subheading:
        "Adult girls one-piece column gowns, double-breasted two-piece co-ords, regal three-piece festive suits, and boned short corset tops.",
      categoryHighlight: "ADULT COUTURE & SHORT TOPS",
      cta1Label: "SHOP ADULT THREE-PIECE",
      cta1Href: "/shop?category=adult-three-piece",
      cta2Label: "SHOP SHORT TOPS",
      cta2Href: "/shop?category=short-tops",
      specs: [
        "CUT: ARCHITECTURAL TAILORING",
        "FABRIC: ITALIAN CREPE & BANARASI",
        "EDITION: RUNWAY 2026",
      ],
    },
  ],
  categories: {
    eyebrow: "THE ATELIER DIRECTORY",
    title: "CURATED CATEGORIES",
    rightLine1: "PETITE ATELIER • MAISON FEMME",
    rightLine2: "HAUTE COUTURE HANDCRAFTED IN BANGLADESH",
    archiveLabel: "BROWSE THE COMPLETE ATELIER ARCHIVE",
    cards: [
      {
        id: "nayra-dress-skirt",
        slug: "nayra-dress-skirt",
        label: "Nayra Dress with Skirt",
        eyebrow: "THE SIGNATURE SILHOUETTE",
        description:
          "Architectural side-slit kurtis paired with dramatic circular flare skirts",
        image:
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80",
        edition: "EDITION // 01",
        featured: true,
      },
      {
        id: "baby-frock",
        slug: "baby-frock",
        label: "Baby Frocks",
        eyebrow: "HEIRLOOM PETITE COUTURE",
        description:
          "Royal velvet, heirloom pearls and cloud-soft organza for little princesses",
        image:
          "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=80",
        edition: "EDITION // 02",
        featured: false,
      },
      {
        id: "two-piece-kids",
        slug: "two-piece-kids",
        label: "Kids Two-Piece",
        eyebrow: "CONTEMPORARY CO-ORDS",
        description: "Structured peplum kurtis with flared palazzos and Belgian linen sets",
        image:
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80",
        edition: "EDITION // 03",
        featured: false,
      },
      {
        id: "three-piece-kids",
        slug: "three-piece-kids",
        label: "Kids Three-Piece",
        eyebrow: "REGAL FESTIVE SUITS",
        description: "Grand Anarkalis, shararas and hand-embroidered scalloped dupattas",
        image:
          "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
        edition: "EDITION // 04",
        featured: false,
      },
      {
        id: "adult-one-piece",
        slug: "adult-one-piece",
        label: "Adult One-Piece",
        eyebrow: "SCULPTURAL COLUMN GOWNS",
        description:
          "Minimalist column dresses, liquid gold silk maxis and dramatic evening tunics",
        image:
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
        edition: "EDITION // 05",
        featured: false,
      },
      {
        id: "adult-two-piece",
        slug: "adult-two-piece",
        label: "Adult Two-Piece",
        eyebrow: "POWER TAILORING & SILK CO-ORDS",
        description: "Tuxedo-cut kurtis, cigarette trousers and fluid sandwashed silk sets",
        image:
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
        edition: "EDITION // 06",
        featured: false,
      },
      {
        id: "adult-three-piece",
        slug: "adult-three-piece",
        label: "Adult Three-Piece",
        eyebrow: "IMPERIAL ZARDOZI COUTURE",
        description: "Over 120 hours of master handwork on raw Banarasi silk with tissue dupattas",
        image:
          "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
        edition: "EDITION // 07",
        featured: true,
      },
      {
        id: "short-tops",
        slug: "short-tops",
        label: "Short Tops",
        eyebrow: "HAUTE SCULPTURAL CUTS",
        description:
          "Architectural corsets with industrial hardware, asymmetric draped silk and peplum tops",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
        edition: "EDITION // 08",
        featured: false,
      },
    ],
  },
  newArrivals: {
    eyebrow: "LATEST DROP",
    title: "NOCTURNE RELEASES",
    linkLabel: "VIEW COMPLETE COLLECTION",
    bannerEyebrow: "LIMITED PRODUCTION RUNS",
    bannerTitle: "LOOKING FOR BESPOKE FIT & CUSTOM TAILORING?",
    bannerBody:
      "We offer bespoke customization on Nayra suits, baby gala frocks, and adult three-piece sets.",
    bannerCta: "INQUIRE ATELIER",
  },
  bestSellers: {
    eyebrow: "THE ICONIC VAULT",
    title: "MOST COVETED PIECES",
    linkLabel: "EXPLORE FULL ARCHIVE",
  },
  seasonal: {
    badge: "SIGNATURE DROP SPOTLIGHT",
    titleLine1: "THE NAYRA DRESS",
    titleLine2: "WITH TWIRL SKIRT",
    body: "Engineered with dramatic high side slits and tailored with hand-beaten gold zari embroidery. Paired with our voluminous circular silk twirl skirt. Available across both Petite and Adult sizes.",
    specs: [
      { label: "SILHOUETTE", value: "Nayra Cut + Skirt" },
      { label: "FABRIC", value: "Mulberry Silk" },
      { label: "SIZING", value: "2Y – Adult XL" },
    ],
    cta1Label: "SHOP NAYRA & SKIRT",
    cta1Href: "/shop?category=nayra-dress-skirt",
    cta2Label: "EXPLORE THREE-PIECE",
    cta2Href: "/shop?category=adult-three-piece",
    image:
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Nayra Dress with Skirt Couture",
    archiveLabel: "ATELIER ARCHIVE",
    archiveRef: "REF: RSR-NAYRA-01",
  },
  brand: {
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Atelier Craftsmanship and Runway",
    heritageLabel: "HERITAGE",
    established: "EST. 1998",
    badgeLeft: "AUTHENTIC BENGAL ATELIER",
    badgeRight: "100% ARTISANAL WEAVE",
    eyebrow: "THE ATELIER PHILOSOPHY",
    titleLine1: "PRECISION CRAFT.",
    titleLine2: "TIMELESS SILHOUETTES.",
    paragraph1:
      "Riser exists at the intersection of oriental grandeur and contemporary architectural minimalism. What began in 1998 has evolved into a high-fashion atelier revered for exceptional tailoring, uncompromising fabrics, and modern silhouettes.",
    paragraph2:
      "From our signature Nayra Dress with Skirt to our delicate Baby Gala Frocks and sculptural Short Tops, each garment is cut from pure mulberry silks, hand-beaten Banarasi brocades, and fine Belgian linens.",
    stats: [
      { value: "25+", label: "YEARS OF ATELIER" },
      { value: "120h", label: "HAND-EMBROIDERY / PIECE" },
      { value: "50", label: "UNITS PER DROP" },
    ],
    ctaLabel: "EXPLORE THE ATELIER MANIFESTO",
    ctaHref: "/about",
  },
  trust: {
    eyebrow: "ATELIER STANDARDS",
    title: "THE RISER ASSURANCE",
    subtitle: "Every garment that leaves our workshop is inspected under strict couture protocols.",
    items: [
      {
        icon: "shield",
        title: "AUTHENTIC ATELIER",
        desc: "100% genuine handcrafted silks, hand-beaten zari and hypoallergenic infant linings.",
      },
      {
        icon: "truck",
        title: "WHITE-GLOVE DISPATCH",
        desc: "Priority express dispatch across Dhaka. Insured nationwide courier network.",
      },
      {
        icon: "returns",
        title: "7-DAY EXCHANGE",
        desc: "Seamless exchange policy for fitting and sizing assurance on all collections.",
      },
      {
        icon: "scissors",
        title: "BESPOKE CUSTOM CUT",
        desc: "Made-to-measure tailoring available for festive Nayra sets and gala baby frocks.",
      },
      {
        icon: "clock",
        title: "ESTABLISHED 1998",
        desc: "Over 25 years of enduring couture excellence and client trust in Bangladesh.",
      },
      {
        icon: "phone",
        title: "DIRECT CLIENT LIAISON",
        desc: "Dedicated personal concierge support via WhatsApp, phone and private consultation.",
      },
    ],
  },
  footer: {
    newsletterEyebrow: "[ THE INSIDERS CIRCLE ]",
    newsletterTitle: "JOIN THE ATELIER REGISTRY",
    newsletterBody:
      "Receive priority private links 24 hours prior to public drops, private salon invitations, and bespoke tailoring access.",
    brandBlurb:
      "Haute couture and luxury garments for girls and women. Redefining heirloom baby frocks, statement Nayra cuts with twirl skirts, tailored two-piece sets, imperial three-piece suits, and architectural short tops.",
    address: "Gulshan 2 • Banani • Dhanmondi, Dhaka",
    phone: "Client Concierge: 01XXXXXXXXX",
    email: "atelier@riser.com.bd",
  },
};
