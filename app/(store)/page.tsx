import type { Metadata } from "next";
import HeroSection from "@/components/store/hero-section";
import CategoryGrid from "@/components/store/category-grid";
import NewArrivalsSection from "@/components/store/new-arrivals-section";
import BestSellersSection from "@/components/store/best-sellers-section";
import BrandStorySection from "@/components/store/brand-story-section";
import SeasonalBanner from "@/components/store/seasonal-banner";
import TrustSection from "@/components/store/trust-section";
import { getSiteContent } from "@/lib/cms/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Riser Atelier — Haute Couture for Girls & Women",
  description:
    "Discover Riser's luxury collection — Signature Nayra Cut with Skirt, Royal Baby Frocks, Kids & Adult Two-Piece and Three-Piece Sets, and Architectural Short Tops.",
};

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <>
      <HeroSection slides={content.hero} />
      <CategoryGrid />
      <NewArrivalsSection copy={content.newArrivals} />
      <SeasonalBanner />
      <BestSellersSection />
      <BrandStorySection />
      <TrustSection />
    </>
  );
}
