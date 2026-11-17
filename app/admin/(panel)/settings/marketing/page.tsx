import type { Metadata } from "next";
import { getMarketingSettingsView } from "@/lib/marketing/settings";
import { listRecentTrackingEvents } from "@/lib/analytics/order-tracking";
import MarketingSettingsClient from "@/components/admin/marketing-settings";

export const metadata: Metadata = {
  title: "SEO & Marketing Integrations — Riser Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MarketingSettingsPage() {
  const [settings, ledger] = await Promise.all([
    getMarketingSettingsView(),
    listRecentTrackingEvents(30),
  ]);
  return <MarketingSettingsClient initial={settings} initialLedger={ledger} />;
}
