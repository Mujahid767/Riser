/**
 * lib/analytics/capi.ts
 * Server-side Meta Conversions API (CAPI) helper.
 * Sends events to Meta to deduplicate with client-side Pixel using matching event_id.
 * Credentials and test_event_code are loaded dynamically from settings or environment variables.
 */
import { getMarketingCredentials } from "@/lib/marketing/settings";

export type CapiEvent = {
  eventName: string;
  eventId: string; // MUST match the client-side fbq eventID for deduplication
  eventSourceUrl: string;
  userPhone?: string; // e.g. 017XXXXXXXX (will be normalized & hashed)
  userEmail?: string;
  userName?: string;
  userCity?: string;
  clientIp?: string;
  clientUserAgent?: string;
  customData?: Record<string, unknown>;
};

export async function sendCapiEvent(event: CapiEvent): Promise<{ ok: boolean; error?: string }> {
  try {
    const creds = await getMarketingCredentials().catch(() => ({
      pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
      capiToken: process.env.META_CAPI_ACCESS_TOKEN,
      testEventCode: undefined,
      purchaseEventTrigger: "ORDER_PLACED" as const,
      enableAdvancedMatching: true,
    }));

    const pixelId = creds.pixelId;
    const token = creds.capiToken;

    if (!pixelId || !token) {
      return { ok: false, error: "Meta Pixel ID or CAPI Access Token not configured." };
    }

    const userData: Record<string, unknown> = {};

    if (creds.enableAdvancedMatching) {
      if (event.userPhone) {
        // Normalize BD phone to +8801XXXXXXXXX or 8801XXXXXXXXX for Meta
        const digits = event.userPhone.replace(/\D/g, "");
        const formatted = digits.startsWith("88") ? digits : `88${digits}`;
        userData.ph = [await hashSha256(formatted)];
      }

      if (event.userEmail && event.userEmail.includes("@")) {
        userData.em = [await hashSha256(event.userEmail.trim().toLowerCase())];
      }

      if (event.userName) {
        const parts = event.userName.trim().toLowerCase().split(/\s+/);
        if (parts[0]) userData.fn = [await hashSha256(parts[0])];
        if (parts.length > 1) userData.ln = [await hashSha256(parts.slice(1).join(" "))];
      }

      if (event.userCity) {
        userData.ct = [await hashSha256(event.userCity.trim().toLowerCase())];
        userData.country = [await hashSha256("bd")];
      }
    }

    if (event.clientIp) userData.client_ip_address = event.clientIp;
    if (event.clientUserAgent) userData.client_user_agent = event.clientUserAgent;

    const eventPayload: Record<string, unknown> = {
      event_name: event.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: event.eventId,
      event_source_url: event.eventSourceUrl,
      action_source: "website",
      user_data: userData,
      custom_data: event.customData ?? {},
    };

    const payload: Record<string, unknown> = {
      data: [eventPayload],
    };

    // If test event code is configured, pass it to view in Meta Events Manager > Test Events
    if (creds.testEventCode) {
      payload.test_event_code = creds.testEventCode;
    }

    const res = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error?.message || `HTTP ${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to send CAPI event" };
  }
}

/** SHA-256 hex digest for Meta advanced matching */
async function hashSha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
