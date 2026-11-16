import type { Metadata } from "next";
import { getSteadfastSettingsView } from "@/lib/courier/settings";
import CourierSettingsClient from "@/components/admin/courier-settings";

export const metadata: Metadata = {
  title: "Courier settings — Riser Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSteadfastSettingsView();
  return <CourierSettingsClient initial={settings} />;
}
