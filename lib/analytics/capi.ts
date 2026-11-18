/**
 * lib/analytics/capi.ts
 * Server-side Meta Conversions API (CAPI) helper.
 * Sends events to Meta using Graph API v26.0 to deduplicate with client-side Pixel
 * via matching event_name + event_id.
 */
import { getMarketingCredentials } from "@/lib/marketing/settings";

export const META_GRAPH_API_VERSION = process.env.META_API_VERSION || "v26.0";

const META_COOKIE_ID_RE = /^fb\.\d+\.\d{10,16}\.[A-Za-z0-9_.\-~]{4,250}$/;

/**
 * Validate a real Meta `_fbp` or `_fbc` identifier.
 * Returns the trimmed value if valid, or undefined (never invents missing IDs).
 */
export function sanitizeMetaIdentifier(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || !META_COOKIE_ID_RE.test(trimmed)) return undefined;
  return trimmed;
}

export type CapiActionSource =
  | "website"
  | "phone_call"
  | "system_generated"
  | "other";

export type CapiEvent = {
  eventName: string;
  eventId: string; // MUST match the client-side fbq eventID when browser also sends the event
  actionSource?: CapiActionSource;
  eventSourceUrl?: string; // Required when actionSource === "website"; omitted for offline/system milestones
  eventTime?: number; // Unix seconds; defaults to now
  userPhone?: string; // e.g. 017XXXXXXXX (normalized & SHA-256 hashed)
  userEmail?: string;
  userName?: string;
  userCity?: string;
  fbp?: string; // _fbp browser cookie (sent unhashed in user_data when present)
  fbc?: string; // _fbc click cookie / derived from fbclid (sent unhashed when present)
  clientIp?: string;
  clientUserAgent?: string;
  customData?: Record<string, unknown>;
};

export type CapiSendResult = {
  ok: boolean;
  error?: string;
  eventsReceived?: number;
};

export async function sendCapiEvent(event: CapiEvent): Promise<CapiSendResult> {
  try {
    const creds = await getMarketingCredentials().catch(() => ({
      pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
      capiToken: process.env.META_CAPI_ACCESS_TOKEN,
      testEventCode: undefined,
      enableAdvancedMatching: true,
    }));

    const pixelId = creds.pixelId?.trim();
    const token = creds.capiToken?.trim();

    if (!pixelId || !token) {
      return { ok: false, error: "Meta Pixel ID or CAPI Access Token not configured." };
    }

    const userData: Record<string, unknown> = {};

    if (creds.enableAdvancedMatching) {
      if (event.userPhone) {
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

    const fbp = sanitizeMetaIdentifier(event.fbp);
    const fbc = sanitizeMetaIdentifier(event.fbc);
    if (fbp) userData.fbp = fbp;
    if (fbc) userData.fbc = fbc;
    if (event.clientIp) userData.client_ip_address = event.clientIp;
    if (event.clientUserAgent) userData.client_user_agent = event.clientUserAgent;

    const actionSource: CapiActionSource = event.actionSource ?? "website";
    const eventPayload: Record<string, unknown> = {
      event_name: event.eventName,
      event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
      event_id: event.eventId,
      action_source: actionSource,
      user_data: userData,
      custom_data: event.customData ?? {},
    };
    if (actionSource === "website" && event.eventSourceUrl) {
      eventPayload.event_source_url = event.eventSourceUrl;
    }

    const payload: Record<string, unknown> = {
      data: [eventPayload],
    };

    if (creds.testEventCode) {
      payload.test_event_code = creds.testEventCode;
    }

    const res = await fetch(
      `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      }
    );

    const data = (await res.json().catch(() => ({}))) as {
      events_received?: unknown;
      error?: { message?: string; code?: number };
    };

    if (!res.ok || data.error) {
      return {
        ok: false,
        error: data.error?.message || `Meta Graph API returned HTTP ${res.status}`,
      };
    }

    if (
      typeof data.events_received !== "number" ||
      !Number.isFinite(data.events_received) ||
      data.events_received < 1
    ) {
      return {
        ok: false,
        error: `Meta Graph API did not acknowledge event receipt (events_received=${String(
          data.events_received ?? "missing"
        )})`,
      };
    }

    return { ok: true, eventsReceived: data.events_received };
  } catch (err) {
    const timedOut = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    return {
      ok: false,
      error: timedOut
        ? "Meta CAPI request timed out after 10s"
        : err instanceof Error
          ? err.message
          : "Failed to send CAPI event",
    };
  }
}

/** SHA-256 hex digest for Meta advanced matching */
async function hashSha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
