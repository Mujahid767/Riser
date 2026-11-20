import type { ProductImageFramingMap } from "@/lib/images/framing";

// High-Fashion Luxury Atelier Products for Riser
// Inspired by D'YAVOL X haute couture dark luxury aesthetics

export interface SeedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string;
  secondaryImageUrl?: string;
  /** Extra gallery photos (admin products) */
  gallery?: string[];
  /** Optional non-destructive crop/fit framing metadata keyed by image URL */
  imageFraming?: ProductImageFramingMap;
  /** Units available. `undefined` = not tracked (demo products). */
  stock?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isLimited?: boolean;
  isOnSale?: boolean;
  editionBadge?: string;
  colors?: Array<{ name: string; value: string }>;
  sizes?: string[];
  /** Optional price per size override e.g. { "16-20": 650, "22-26": 750 } */
  sizePrices?: Record<string, number>;
  /** Optional stock per size e.g. { "16-20": 4, "22-26": 1 } */
  sizeStock?: Record<string, number>;
  category:
    | "baby-frock"
    | "baby-party-frock"
    | "two-piece-kids"
    | "three-piece-kids"
    | "nayra-dress-skirt"
    | "adult-one-piece"
    | "adult-two-piece"
    | "adult-three-piece"
    | "short-tops"
    | string;
  department: "petite" | "women";
  description: string;
  fabric: string;
  tags: string[];
}

export const SEED_PRODUCTS: SeedProduct[] = [
  // ─────────────────────────────────────────────────────────────
  // 1. NAYRA DRESS WITH SKIRT (Signature Royal Drop)
  // ─────────────────────────────────────────────────────────────
  {
    id: "rsr-ny-01",
    name: "Onyx Gold Nayra Cut Kurti with Flared Skirt",
    slug: "onyx-gold-nayra-dress-skirt",
    price: 6850,
    compareAtPrice: 8200,
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
    secondaryImageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80",
    isNew: true,
    isBestSeller: true,
    isLimited: true,
    editionBadge: "SIGNATURE DROP 01",
    colors: [
      { name: "Obsidian Noir & Gold", value: "#141416" },
      { name: "Imperial Crimson", value: "#8b0e0e" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "nayra-dress-skirt",
    department: "women",
    fabric: "Pure Raw Mulberry Silk & Zari Weave",
    description:
      "A statement architectural Nayra cut featuring dramatic side slits accentuated with hand-beaten gold zari embroidery, paired with a multi-tiered circular silk flare skirt.",
    tags: ["nayra", "skirt", "festive", "couture", "zari"],
  },
  {
    id: "rsr-ny-02",
    name: "Crimson Velvet Nayra Suit & Tiered Silk Skirt",
    slug: "crimson-velvet-nayra-dress-skirt",
    price: 7450,
    compareAtPrice: 8900,
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
    secondaryImageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
    isNew: true,
    isLimited: true,
    editionBadge: "LIMITED ATELIER",
    colors: [
      { name: "Deep Ruby Velvet", value: "#580b0b" },
      { name: "Midnight Charcoal", value: "#1f1f23" },
    ],
    sizes: ["S", "M", "L", "XL"],
    category: "nayra-dress-skirt",
    department: "women",
    fabric: "Micro-Velvet & Tissue Organza",
    description:
      "Hand-embellished zardozi work adorning the high side-slit yoke, cascading gracefully over a pleated micro-tissue organza twirl skirt.",
    tags: ["nayra", "velvet", "skirt", "wedding", "luxury"],
  },
  {
    id: "rsr-ny-03",
    name: "Petite Princess Nayra Cut Dress with Gold Trim Skirt",
    slug: "petite-princess-nayra-dress-skirt",
    price: 4250,
    compareAtPrice: 4950,
    imageUrl: "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=900&q=80",
    secondaryImageUrl: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80",
    isBestSeller: true,
    editionBadge: "PETITE ATELIER",
    colors: [
      { name: "Rose Gold & Blush", value: "#e8c3b9" },
      { name: "Royal Emerald", value: "#0c3b2e" },
    ],
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-12Y"],
    category: "nayra-dress-skirt",
    department: "petite",
    fabric: "Chanderi Silk with Soft Cotton Voile Lining",
    description:
      "Designed specifically for young princesses. Light, twirl-friendly flowing skirt paired with an artisanal Nayra cut kurti lined in breathable soft cotton.",
    tags: ["kids-nayra", "petite", "girls", "festive"],
  },

  // ─────────────────────────────────────────────────────────────
  // 2. BABY FROCKS (Petite Royal Collection)
  // ─────────────────────────────────────────────────────────────
  {
    id: "rsr-bf-01",
    name: "Heirloom Pearl & Organza Baby Frock",
    slug: "heirloom-pearl-organza-baby-frock",
    price: 3650,
    compareAtPrice: 4200,
    imageUrl: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=80",
    secondaryImageUrl: "https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=900&q=80",
    isNew: true,
    isBestSeller: true,
    editionBadge: "HERITAGE COUTURE",
    colors: [
      { name: "Vintage Ivory", value: "#faf7f2" },
      { name: "Champagne Pearl", value: "#f1e8dc" },
    ],
    sizes: ["0-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y"],
    category: "baby-frock",
    department: "petite",
    fabric: "Pure French Lace & Mulberry Silk Organza",
    description:
      "A masterpiece of heirloom craftsmanship. Intricate hand-stitched faux pearls, cloud-soft tiered organza frills, and a hypoallergenic organic cotton lining.",
    tags: ["baby-frock", "heirloom", "pearl", "birthday", "party"],
  },
  {
    id: "rsr-bf-02",
    name: "Royal Crimson Velvet Gala Baby Frock",
    slug: "royal-crimson-velvet-gala-baby-frock",
    price: 3850,
    imageUrl: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80",
    secondaryImageUrl: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=80",
    isLimited: true,
    editionBadge: "LIMITED DROP",
    colors: [
      { name: "Riser Red", value: "#e51515" },
      { name: "Nocturne Black", value: "#0d0d11" },
    ],
    sizes: ["6-12M", "1-2Y", "2-3Y", "4-5Y"],
    category: "baby-frock",
    department: "petite",
    fabric: "Silk-Blend Velvet with Gold Brocade",
    description:
      "Plush micro-velvet tailored with gold thread borders and an architectural back sash. Built for gala nights and prestigious occasions.",
    tags: ["baby-frock", "velvet", "red", "gala", "eid"],
  },
  {
    id: "rsr-bf-03",
    name: "Celestial Lavender Tulle Petite Frock",
    slug: "celestial-lavender-tulle-baby-frock",
    price: 2950,
    compareAtPrice: 3400,
    imageUrl: "https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=900&q=80",
    isOnSale: true,
    editionBadge: "ARCHIVE DROP",
    colors: [
      { name: "Mist Lavender", value: "#dcd6f7" },
      { name: "Cloud White", value: "#ffffff" },
    ],
    sizes: ["0-6M", "6-12M", "1-2Y", "2-3Y"],
    category: "baby-frock",
    department: "petite",
    fabric: "Featherweight Micro-Tulle & Cotton Satin",
    description:
      "Delicate hand-cut petals scattered across a volumized six-layer soft tulle silhouette with hidden zipper and smooth infant-safe seams.",
    tags: ["baby-frock", "tulle", "lavender", "soft"],
  },

  // ─────────────────────────────────────────────────────────────
  // 3. TWO-PIECE (Kids Collection)
  // ─────────────────────────────────────────────────────────────
  {
    id: "rsr-tpk-01",
    name: "Architectural Peplum Kurti & Flared Palazzo 2-Piece",
    slug: "architectural-peplum-kurti-palazzo-kids",
    price: 3850,
    imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80",
    secondaryImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    isNew: true,
    editionBadge: "EDITION 02",
    colors: [
      { name: "Lapis Lazuli", value: "#1e3a8a" },
      { name: "Sterling Silver", value: "#d1d5db" },
    ],
    sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y", "11-12Y"],
    category: "two-piece-kids",
    department: "petite",
    fabric: "Embossed Brocade Silk & Satin Crepe",
    description:
      "A modern high-fashion two-piece silhouette for girls. Features structured geometric peplum kurti with flared, weighted silk palazzo trousers.",
    tags: ["kids-two-piece", "palazzo", "peplum", "couture"],
  },
  {
    id: "rsr-tpk-02",
    name: "Modernist Linen Co-ord Top & Cullotte 2-Piece",
    slug: "modernist-linen-coord-kids",
    price: 3200,
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    editionBadge: "MINIMALIST LUXE",
    colors: [
      { name: "Raw Ochre", value: "#ca8a04" },
      { name: "Sand Ecru", value: "#e5e5d8" },
    ],
    sizes: ["4-5Y", "6-7Y", "8-9Y", "10-12Y"],
    category: "two-piece-kids",
    department: "petite",
    fabric: "100% Belgian Organic Washed Linen",
    description:
      "Minimalist architectural silhouette featuring mother-of-pearl buttons, tailored boxy crop top, and ankle-grazing wide-leg culottes.",
    tags: ["kids-two-piece", "linen", "minimalist", "summer"],
  },

  // ─────────────────────────────────────────────────────────────
  // 4. THREE-PIECE (Kids Collection)
  // ─────────────────────────────────────────────────────────────
  {
    id: "rsr-thpk-01",
    name: "Regal Velvet Sharara Three-Piece with Zari Dupatta",
    slug: "regal-velvet-sharara-three-piece-kids",
    price: 4950,
    compareAtPrice: 5800,
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
    secondaryImageUrl: "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=900&q=80",
    isBestSeller: true,
    isLimited: true,
    editionBadge: "FESTIVE COUTURE",
    colors: [
      { name: "Imperial Emerald", value: "#064e3b" },
      { name: "Royal Maroon", value: "#7f1d1d" },
    ],
    sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y", "11-12Y"],
    category: "three-piece-kids",
    department: "petite",
    fabric: "Silk Velvet, Crushed Tissue & Sheer Organza",
    description:
      "Complete festive 3-piece set for celebratory events. Detailed hand-embroidered neckline, double-flare crushed sharara pants, and pure organza dupatta.",
    tags: ["kids-three-piece", "sharara", "velvet", "eid"],
  },
  {
    id: "rsr-thpk-02",
    name: "Artisanal Anarkali Kurta, Churidar & Scalloped Dupatta",
    slug: "artisanal-anarkali-three-piece-kids",
    price: 4600,
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
    editionBadge: "LIMITED RELEASE",
    colors: [
      { name: "Ruby Sunset", value: "#991b1b" },
      { name: "Champagne Gold", value: "#d4af37" },
    ],
    sizes: ["4-5Y", "6-7Y", "8-9Y", "10-12Y"],
    category: "three-piece-kids",
    department: "petite",
    fabric: "Georgette with Mirror Embellishments",
    description:
      "A breathtaking 24-kali flared Anarkali paired with stretch silk churidar and a foil-scalloped sheer dupatta.",
    tags: ["kids-three-piece", "anarkali", "dupatta", "wedding"],
  },

  // ─────────────────────────────────────────────────────────────
  // 5. ADULT GIRLS ONE-PIECE (Women Haute Couture)
  // ─────────────────────────────────────────────────────────────
  {
    id: "rsr-ao-01",
    name: "The Nocturne Minimalist Column Gown",
    slug: "nocturne-minimalist-column-gown-one-piece",
    price: 8900,
    compareAtPrice: 10500,
    imageUrl: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
    secondaryImageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    isNew: true,
    isLimited: true,
    editionBadge: "ARCHIVE 01",
    colors: [
      { name: "Absolute Black", value: "#050505" },
      { name: "Platinum Slate", value: "#334155" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "adult-one-piece",
    department: "women",
    fabric: "Heavy Italian Silk Crepe & Bonded Satin",
    description:
      "Inspired by dark architectural minimalism. High structured neckline, razor-sharp shoulder contouring, and a floor-sweeping side vent.",
    tags: ["adult-one-piece", "gown", "black", "minimalist", "luxury"],
  },
  {
    id: "rsr-ao-02",
    name: "Liquid Gold Draped Silk One-Piece Maxi",
    slug: "liquid-gold-draped-silk-maxi-one-piece",
    price: 9450,
    imageUrl: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    editionBadge: "VIP EDITION",
    colors: [
      { name: "Metallic Champagne", value: "#e2b866" },
      { name: "Midnight Onyx", value: "#18181b" },
    ],
    sizes: ["XS", "S", "M", "L"],
    category: "adult-one-piece",
    department: "women",
    fabric: "Hammered Silk Charmeuse",
    description:
      "Liquid-like drape that contours effortlessly. Bias-cut silhouette designed for luxury galas, black-tie events, and VIP celebrations.",
    tags: ["adult-one-piece", "silk", "gold", "evening"],
  },

  // ─────────────────────────────────────────────────────────────
  // 6. ADULT GIRLS TWO-PIECE (Tailored & Co-ords)
  // ─────────────────────────────────────────────────────────────
  {
    id: "rsr-at-01",
    name: "Architectural Tuxedo Short Kurti & Cigarette Pant Two-Piece",
    slug: "architectural-tuxedo-kurti-cigarette-pant-two-piece",
    price: 7650,
    compareAtPrice: 8900,
    imageUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
    secondaryImageUrl: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80",
    isNew: true,
    isBestSeller: true,
    editionBadge: "SIGNATURE TWO-PIECE",
    colors: [
      { name: "Carbon Noir", value: "#111114" },
      { name: "Pure Ivory", value: "#ffffff" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "adult-two-piece",
    department: "women",
    fabric: "Raw Silk Matrix & Wool-Silk Blend",
    description:
      "A power silhouette blending oriental elegance with sharp Parisian tailoring. Double-breasted crossover kurti accented with titanium buttons.",
    tags: ["adult-two-piece", "co-ord", "tailored", "power-dressing"],
  },
  {
    id: "rsr-at-02",
    name: "Monochromatic Satin Co-ord: Tunic & Wide Fluid Trouser",
    slug: "monochromatic-satin-coord-two-piece",
    price: 6450,
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
    editionBadge: "LIMITED DROP",
    colors: [
      { name: "Espresso Bronze", value: "#3d2b1f" },
      { name: "Silver Ash", value: "#9ca3af" },
    ],
    sizes: ["S", "M", "L", "XL"],
    category: "adult-two-piece",
    department: "women",
    fabric: "Heavyweight Sandwashed Silk",
    description:
      "Effortless luxury. Dropped-shoulder fluid tunic paired with high-waisted floor-skimming wide-leg palazzo trousers.",
    tags: ["adult-two-piece", "satin", "wide-leg", "lounge-luxe"],
  },

  // ─────────────────────────────────────────────────────────────
  // 7. ADULT GIRLS THREE-PIECE (Royal Festive Coutures)
  // ─────────────────────────────────────────────────────────────
  {
    id: "rsr-ath-01",
    name: "Imperial Zardozi Raw Silk Three-Piece with Organza Dupatta",
    slug: "imperial-zardozi-silk-three-piece",
    price: 11500,
    compareAtPrice: 13800,
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
    secondaryImageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
    isNew: true,
    isBestSeller: true,
    isLimited: true,
    editionBadge: "THE MASTERPIECE",
    colors: [
      { name: "Imperial Crimson & Gold", value: "#8b0e0e" },
      { name: "Midnight Sapphire", value: "#0f172a" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "adult-three-piece",
    department: "women",
    fabric: "100% Handloom Banarasi Silk & Tissue Silk",
    description:
      "Over 120 hours of master artisan handwork. Traditional zardozi, dabka, and nakshi motifs on raw silk, paired with a 2.75m scalloped tissue organza dupatta.",
    tags: ["adult-three-piece", "bridal", "zardozi", "eid", "heritage"],
  },
  {
    id: "rsr-ath-02",
    name: "Gilded Chanderi Embroidered Three-Piece Suit",
    slug: "gilded-chanderi-embroidered-three-piece",
    price: 8950,
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
    editionBadge: "COUTURE EDITION",
    colors: [
      { name: "Opal Ecru", value: "#fdfbf7" },
      { name: "Emerald Glaze", value: "#044343" },
    ],
    sizes: ["S", "M", "L", "XL"],
    category: "adult-three-piece",
    department: "women",
    fabric: "Chanderi Silk with Thread-Work Borders",
    description:
      "Sophisticated understatement. Straight-cut long kurta with tonal resham embroidery, matched with silk cigarette pants and an airy hand-painted dupatta.",
    tags: ["adult-three-piece", "chanderi", "formal", "subtle-luxury"],
  },

  // ─────────────────────────────────────────────────────────────
  // 8. SHORT TOPS (Modern Sculptural Tops)
  // ─────────────────────────────────────────────────────────────
  {
    id: "rsr-st-01",
    name: "Architectural Boned Corset Short Top",
    slug: "architectural-boned-corset-short-top",
    price: 3450,
    compareAtPrice: 4200,
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    secondaryImageUrl: "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=900&q=80",
    isNew: true,
    isBestSeller: true,
    editionBadge: "HAUTE CUT",
    colors: [
      { name: "Matte Pitch Black", value: "#09090b" },
      { name: "Titanium Silver", value: "#e2e8f0" },
    ],
    sizes: ["XS", "S", "M", "L"],
    category: "short-tops",
    department: "women",
    fabric: "Bonded Satin Twill with Flexible Metal Boning",
    description:
      "D'YAVOL X inspired structural contouring. Internal flexible boning that sculpts the silhouette, finished with a heavy gunmetal industrial back zipper.",
    tags: ["short-tops", "corset", "architectural", "nightout", "edgy"],
  },
  {
    id: "rsr-st-02",
    name: "Draped Asymmetric Silk Crepe Short Top",
    slug: "draped-asymmetric-silk-short-top",
    price: 2850,
    imageUrl: "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?auto=format&fit=crop&w=900&q=80",
    editionBadge: "DROP 03",
    colors: [
      { name: "Riser Crimson", value: "#e51515" },
      { name: "Chalk White", value: "#f8fafc" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    category: "short-tops",
    department: "women",
    fabric: "Double-Georgette Silk",
    description:
      "Sculptural one-shoulder drape cascading into a sharp cropped hem. Pairs seamlessly with tailored trousers, skirts, or denim.",
    tags: ["short-tops", "silk", "asymmetric", "contemporary"],
  },
  {
    id: "rsr-st-03",
    name: "Structured Peplum Short Blouse with Metallic Hardware",
    slug: "structured-peplum-short-blouse",
    price: 3150,
    imageUrl: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=900&q=80",
    editionBadge: "ATELIER CRAFT",
    colors: [
      { name: "Champagne Lustre", value: "#f7e7ce" },
      { name: "Onyx Black", value: "#18181b" },
    ],
    sizes: ["S", "M", "L"],
    category: "short-tops",
    department: "women",
    fabric: "Crisp Jacquard Silk Weave",
    description:
      "Flared peplum waistline with structured box pleats and custom-cast brushed bronze buttons.",
    tags: ["short-tops", "peplum", "jacquard", "elegant"],
  },
];

export function getSeedProducts(): SeedProduct[] {
  return SEED_PRODUCTS;
}

export function getSeedProductBySlug(slug: string): SeedProduct | undefined {
  return SEED_PRODUCTS.find((p) => p.slug === slug);
}

export function getSeedProductsByCategory(category: string): SeedProduct[] {
  if (category === "new-arrivals") return SEED_PRODUCTS.filter((p) => p.isNew);
  if (category === "best-sellers") return SEED_PRODUCTS.filter((p) => p.isBestSeller);
  if (category === "petite") return SEED_PRODUCTS.filter((p) => p.department === "petite");
  if (category === "women") return SEED_PRODUCTS.filter((p) => p.department === "women");
  if (category === "frocks") return SEED_PRODUCTS.filter((p) => p.category === "baby-frock");
  if (category === "tops") return SEED_PRODUCTS.filter((p) => p.category === "short-tops");
  if (category === "dresses")
    return SEED_PRODUCTS.filter(
      (p) => p.category === "nayra-dress-skirt" || p.category === "adult-one-piece"
    );
  if (category === "party-wear")
    return SEED_PRODUCTS.filter(
      (p) => p.category === "adult-three-piece" || p.category === "three-piece-kids"
    );
  if (category === "cotton")
    return SEED_PRODUCTS.filter(
      (p) => p.category === "two-piece-kids" || p.category === "adult-two-piece"
    );
  return SEED_PRODUCTS.filter((p) => p.category === category);
}

export const LUXURY_CATEGORIES = [
  {
    id: "nayra-dress-skirt",
    slug: "nayra-dress-skirt",
    label: "Nayra Dress with Skirt",
    eyebrow: "THE SIGNATURE SILHOUETTE",
    description: "Architectural side-slit kurtis paired with dramatic circular flare skirts",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80",
    edition: "EDITION // 01",
    featured: true,
  },
  {
    id: "baby-frock",
    slug: "baby-frock",
    label: "Baby Frocks",
    eyebrow: "HEIRLOOM PETITE COUTURE",
    description: "Royal velvet, heirloom pearls and cloud-soft organza for little princesses",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=80",
    edition: "EDITION // 02",
    featured: false,
  },
  {
    id: "two-piece-kids",
    slug: "two-piece-kids",
    label: "Kids Two-Piece",
    eyebrow: "CONTEMPORARY CO-ORDS",
    description: "Structured peplum kurtis with flared palazzos and Belgian linen sets",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=80",
    edition: "EDITION // 03",
    featured: false,
  },
  {
    id: "three-piece-kids",
    slug: "three-piece-kids",
    label: "Kids Three-Piece",
    eyebrow: "REGAL FESTIVE SUITS",
    description: "Grand Anarkalis, shararas and hand-embroidered scalloped dupattas",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80",
    edition: "EDITION // 04",
    featured: false,
  },
  {
    id: "adult-one-piece",
    slug: "adult-one-piece",
    label: "Adult One-Piece",
    eyebrow: "SCULPTURAL COLUMN GOWNS",
    description: "Minimalist column dresses, liquid gold silk maxis and dramatic evening tunics",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
    edition: "EDITION // 05",
    featured: false,
  },
  {
    id: "adult-two-piece",
    slug: "adult-two-piece",
    label: "Adult Two-Piece",
    eyebrow: "POWER TAILORING & SILK CO-ORDS",
    description: "Tuxedo-cut kurtis, cigarette trousers and fluid sandwashed silk sets",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
    edition: "EDITION // 06",
    featured: false,
  },
  {
    id: "adult-three-piece",
    slug: "adult-three-piece",
    label: "Adult Three-Piece",
    eyebrow: "IMPERIAL ZARDOZI COUTURE",
    description: "Over 120 hours of master handwork on raw Banarasi silk with tissue dupattas",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80",
    edition: "EDITION // 07",
    featured: true,
  },
  {
    id: "short-tops",
    slug: "short-tops",
    label: "Short Tops",
    eyebrow: "HAUTE SCULPTURAL CUTS",
    description: "Architectural corsets with industrial hardware, asymmetric draped silk and peplum tops",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    edition: "EDITION // 08",
    featured: false,
  },
];
