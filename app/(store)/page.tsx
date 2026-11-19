import type { Metadata } from "next";
import HeroSection from "@/components/store/hero-section";
import CategoryGrid from "@/components/store/category-grid";
import NewArrivalsSection from "@/components/store/new-arrivals-section";
import BestSellersSection from "@/components/store/best-sellers-section";
import BrandStorySection from "@/components/store/brand-story-section";
import SeasonalBanner from "@/components/store/seasonal-banner";
import TrustSection from "@/components/store/trust-section";
import { getSiteContent } from "@/lib/cms/store";
import { getCatalogProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Riser — Girls' Dresses, Baby Frocks & Party Wear in Bangladesh",
  description:
    "Explore Riser's collection of girls' baby frocks, party frocks, Nayra Cut sets, kids two-piece and three-piece outfits, and women's ethnic wear — crafted since 1998.",
};

export default async function HomePage() {
  const [content, products] = await Promise.all([getSiteContent(), getCatalogProducts()]);
  const hiddenCategorySlugs = content.categories.cards
    .filter((c) => c.hidden)
    .map((c) => c.slug);
  const hiddenSlugSet = new Set(hiddenCategorySlugs);
  const targetsHiddenCategory = (href: string) => {
    const qIndex = href.indexOf("category=");
    if (qIndex === -1) return false;
    const slug = href.slice(qIndex + "category=".length).split("&")[0];
    return hiddenSlugSet.has(slug);
  };
  const filteredSlides = content.hero.filter(
    (slide) => !(targetsHiddenCategory(slide.cta1Href) && targetsHiddenCategory(slide.cta2Href))
  );
  const heroSlides = filteredSlides.length > 0 ? filteredSlides : content.hero;

  return (
    <>
      <HeroSection slides={heroSlides} />
      <NewArrivalsSection
        copy={content.newArrivals}
        products={products}
        hiddenCategories={hiddenCategorySlugs}
      />
      <BestSellersSection />
      <SeasonalBanner />
      <CategoryGrid />
      <BrandStorySection />
      <TrustSection />
    </>
  );
}
