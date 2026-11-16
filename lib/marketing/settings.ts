/**
 * lib/marketing/settings.ts
 * Manages SEO & Marketing Integration settings (GTM, GA4, Meta Pixel, Meta CAPI, Search Console, Domain Verification).
 * Stored in PostgreSQL with encrypted access token, with fallback to environment variables.
 */
import prisma from "@/lib/db";
import { decryptSecret, encryptSecret, maskSecret } from "@/lib/courier/crypto";

export type MarketingSettingsInput = {
  gtmId?: string;
  ga4Id?: string;
  metaPixelId?: string;
  metaCapiToken?: string;
  metaTestEventCode?: string;
  googleSiteVerification?: string;
  facebookDomainVerification?: string;
  purchaseEventTrigger?: "ORDER_PLACED" | "ORDER_DELIVERED";
  enableAdvancedMatching?: boolean;
};

export type MarketingSettingsView = {
  gtmId: string;
  ga4Id: string;
  metaPixelId: string;
  metaCapiTokenMasked: string;
  hasMetaCapiToken: boolean;
  metaTestEventCode: string;
  googleSiteVerification: string;
  facebookDomainVerification: string;
  purchaseEventTrigger: "ORDER_PLACED" | "ORDER_DELIVERED";
  enableAdvancedMatching: boolean;
  updatedAt: string | null;
  feedUrl: string;
  sitemapUrl: string;
};

export type PublicMarketingConfig = {
  gtmId?: string;
  ga4Id?: string;
  metaPixelId?: string;
  googleSiteVerification?: string;
  facebookDomainVerification?: string;
};

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://riser.com.bd";
}

/** Admin view with masked secrets */
export async function getMarketingSettingsView(): Promise<MarketingSettingsView> {
  const row = await prisma.marketingSettings.findUnique({ where: { id: "default" } }).catch(() => null);

  const envPixel = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
  const envGa4 = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
  const envToken = process.env.META_CAPI_ACCESS_TOKEN || "";

  const rawToken = decryptSecret(row?.metaCapiTokenEnc) || (row ? "" : envToken);

  const baseUrl = getBaseUrl();

  return {
    gtmId: row?.gtmId ?? "",
    ga4Id: row?.ga4Id || (!row ? envGa4 : ""),
    metaPixelId: row?.metaPixelId || (!row ? envPixel : ""),
    metaCapiTokenMasked: maskSecret(rawToken),
    hasMetaCapiToken: Boolean(rawToken),
    metaTestEventCode: row?.metaTestEventCode ?? "",
    googleSiteVerification: row?.googleSiteVerification ?? "",
    facebookDomainVerification: row?.facebookDomainVerification ?? "",
    purchaseEventTrigger: (row?.purchaseEventTrigger as "ORDER_PLACED" | "ORDER_DELIVERED") || "ORDER_PLACED",
    enableAdvancedMatching: row?.enableAdvancedMatching ?? true,
    updatedAt: row?.updatedAt?.toISOString() ?? null,
    feedUrl: `${baseUrl}/api/feeds/facebook`,
    sitemapUrl: `${baseUrl}/sitemap.xml`,
  };
}

/** Server-side only: full decrypted credentials for CAPI execution */
export async function getMarketingCredentials(): Promise<{
  pixelId?: string;
  capiToken?: string;
  testEventCode?: string;
  purchaseEventTrigger: "ORDER_PLACED" | "ORDER_DELIVERED";
  enableAdvancedMatching: boolean;
}> {
  const row = await prisma.marketingSettings.findUnique({ where: { id: "default" } }).catch(() => null);

  const pixelId = row?.metaPixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID || undefined;
  const dbToken = decryptSecret(row?.metaCapiTokenEnc);
  const capiToken = dbToken || process.env.META_CAPI_ACCESS_TOKEN || undefined;

  return {
    pixelId: pixelId || undefined,
    capiToken: capiToken || undefined,
    testEventCode: row?.metaTestEventCode?.trim() || undefined,
    purchaseEventTrigger: (row?.purchaseEventTrigger as "ORDER_PLACED" | "ORDER_DELIVERED") || "ORDER_PLACED",
    enableAdvancedMatching: row?.enableAdvancedMatching ?? true,
  };
}

/** Public settings injected in HTML head (no secrets) */
export async function getPublicMarketingConfig(): Promise<PublicMarketingConfig> {
  const row = await prisma.marketingSettings.findUnique({ where: { id: "default" } }).catch(() => null);

  return {
    gtmId: row?.gtmId?.trim() || undefined,
    ga4Id: (row?.ga4Id?.trim() || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "").trim() || undefined,
    metaPixelId: (row?.metaPixelId?.trim() || process.env.NEXT_PUBLIC_META_PIXEL_ID || "").trim() || undefined,
    googleSiteVerification: row?.googleSiteVerification?.trim() || undefined,
    facebookDomainVerification: row?.facebookDomainVerification?.trim() || undefined,
  };
}

/** Save updated marketing settings */
export async function saveMarketingSettings(input: MarketingSettingsInput) {
  const existing = await prisma.marketingSettings.findUnique({ where: { id: "default" } }).catch(() => null);

  const clean = (val?: string) => (typeof val === "string" ? val.trim() : undefined);

  let tokenEnc = existing?.metaCapiTokenEnc ?? null;
  if (input.metaCapiToken !== undefined) {
    if (input.metaCapiToken.trim() === "") {
      // Keep existing if blank and we already have one, or clear if specified
    } else {
      tokenEnc = encryptSecret(input.metaCapiToken.trim());
    }
  }

  const data = {
    gtmId: clean(input.gtmId) ?? existing?.gtmId ?? null,
    ga4Id: clean(input.ga4Id) ?? existing?.ga4Id ?? null,
    metaPixelId: clean(input.metaPixelId) ?? existing?.metaPixelId ?? null,
    metaCapiTokenEnc: tokenEnc,
    metaTestEventCode: clean(input.metaTestEventCode) ?? existing?.metaTestEventCode ?? null,
    googleSiteVerification: clean(input.googleSiteVerification) ?? existing?.googleSiteVerification ?? null,
    facebookDomainVerification: clean(input.facebookDomainVerification) ?? existing?.facebookDomainVerification ?? null,
    purchaseEventTrigger: input.purchaseEventTrigger ?? existing?.purchaseEventTrigger ?? "ORDER_PLACED",
    enableAdvancedMatching: input.enableAdvancedMatching ?? existing?.enableAdvancedMatching ?? true,
  };

  await prisma.marketingSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });
}
