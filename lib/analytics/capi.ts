/**
 * lib/analytics/capi.ts
 * Server-side Meta Conversions API (CAPI) helper.
 * Sends events to Meta to deduplicate with client-side Pixel.
 * Requires NEXT_PUBLIC_META_PIXEL_ID and META_CAPI_ACCESS_TOKEN in env.
 */

export type CapiEvent = {
  eventName: string;
  eventId: string;         // must match the client-side fbq eventID
  eventSourceUrl: string;
  userPhone?: string;      // normalized E.164 (optional advanced matching)
  userEmail?: string;
  customData?: Record<string, unknown>;
};

export async function sendCapiEvent(event: CapiEvent): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !token) return; // silently skip if not configured

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl,
        action_source: "website",
        user_data: {
          ...(event.userPhone
            ? { ph: [hashSha256(event.userPhone)] }
            : {}),
          ...(event.userEmail
            ? { em: [hashSha256(event.userEmail.toLowerCase())] }
            : {}),
        },
        custom_data: event.customData ?? {},
      },
    ],
  };

  try {
    await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
  } catch {
    // Non-critical — don't break the order flow if CAPI fails
  }
}

/** SHA-256 hex digest for Meta advanced matching */
async function hashSha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
