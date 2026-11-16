import type { Metadata } from "next";
import { getMarketingSettingsView } from "@/lib/marketing/settings";
import MarketingSettingsClient from "@/components/admin/marketing-settings";

export const metadata: Metadata = {
  title: "SEO & Marketing Integrations — Riser Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MarketingSettingsPage() {
  const settings = await getMarketingSettingsView();
  return <MarketingSettingsClient initial={settings} />;
}
