/**
 * lib/courier/settings.ts
 * Read / write the Steadfast credentials the admin enters in Settings → Courier.
 */
import prisma from "@/lib/db";
import { decryptSecret, encryptSecret, maskSecret } from "./crypto";

const PROVIDER = "steadfast";

export type SteadfastCredentials = {
  email: string;
  password: string;
  apiKey: string;
  secretKey: string;
};

/** What the admin UI is allowed to see — never the raw secrets. */
export type SteadfastSettingsView = {
  email: string;
  enabled: boolean;
  hasPassword: boolean;
  apiKeyMasked: string;
  secretKeyMasked: string;
  configured: boolean;
  updatedAt: string | null;
};

export async function getSteadfastSettingsView(): Promise<SteadfastSettingsView> {
  const row = await prisma.courierSettings.findUnique({ where: { id: PROVIDER } });
  const apiKey = decryptSecret(row?.apiKeyEnc);
  const secretKey = decryptSecret(row?.secretKeyEnc);
  return {
    email: row?.email ?? "",
    enabled: row?.enabled ?? true,
    hasPassword: Boolean(decryptSecret(row?.passwordEnc)),
    apiKeyMasked: maskSecret(apiKey),
    secretKeyMasked: maskSecret(secretKey),
    configured: Boolean(apiKey && secretKey),
    updatedAt: row?.updatedAt.toISOString() ?? null,
  };
}

/** Server-side only: full credentials for calling the Steadfast API. */
export async function getSteadfastCredentials(): Promise<{
  apiKey: string;
  secretKey: string;
  enabled: boolean;
} | null> {
  const row = await prisma.courierSettings.findUnique({ where: { id: PROVIDER } });
  const apiKey = decryptSecret(row?.apiKeyEnc);
  const secretKey = decryptSecret(row?.secretKeyEnc);
  if (!row || !apiKey || !secretKey) return null;
  return { apiKey, secretKey, enabled: row.enabled };
}

/**
 * Save settings. A blank secret field means "keep the stored value", so the admin
 * doesn't have to re-type keys every time they change the email.
 */
export async function saveSteadfastSettings(input: Partial<SteadfastCredentials> & { enabled?: boolean }) {
  const existing = await prisma.courierSettings.findUnique({ where: { id: PROVIDER } });
  const data = {
    email: input.email?.trim() ? input.email.trim() : existing?.email ?? null,
    passwordEnc: input.password ? encryptSecret(input.password) : existing?.passwordEnc ?? null,
    apiKeyEnc: input.apiKey?.trim() ? encryptSecret(input.apiKey.trim()) : existing?.apiKeyEnc ?? null,
    secretKeyEnc: input.secretKey?.trim() ? encryptSecret(input.secretKey.trim()) : existing?.secretKeyEnc ?? null,
    enabled: input.enabled ?? existing?.enabled ?? true,
  };
  await prisma.courierSettings.upsert({
    where: { id: PROVIDER },
    create: { id: PROVIDER, ...data },
    update: data,
  });
}
