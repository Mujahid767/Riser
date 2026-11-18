/**
 * lib/analytics/fb-cookies.ts
 * Helpers to read, validate, and capture genuine Meta `_fbp` / `_fbc` identifiers.
 * Never fabricates missing identifiers when unavailable or tracking is declined.
 */

export type MetaClickIdentifiers = {
  fbp?: string;
  fbc?: string;
};

const META_COOKIE_ID_RE = /^fb\.\d+\.\d{10,16}\.[A-Za-z0-9_.\-~]{4,250}$/;
const FBCLID_RE = /^[A-Za-z0-9_.\-~]{4,250}$/;
const FBC_SESSION_STORAGE_KEY = "riser_meta_fbc";

export function sanitizeMetaCookieId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed || !META_COOKIE_ID_RE.test(trimmed)) return undefined;
  return trimmed;
}

export function extractMetaIdentifiersFromCookieHeader(
  cookieHeader: string | null | undefined
): MetaClickIdentifiers {
  if (!cookieHeader) return {};
  const map: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const eqIdx = part.indexOf("=");
    if (eqIdx === -1) continue;
    const name = part.slice(0, eqIdx).trim();
    if (name !== "_fbp" && name !== "_fbc") continue;
    const rawVal = part.slice(eqIdx + 1).trim();
    try {
      map[name] = decodeURIComponent(rawVal);
    } catch {
      map[name] = rawVal;
    }
  }
  return {
    fbp: sanitizeMetaCookieId(map._fbp),
    fbc: sanitizeMetaCookieId(map._fbc),
  };
}

export function areTrackingCookiesPermittedInBrowser(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  if (navigator.cookieEnabled === false) return false;
  const navWithPrivacy = navigator as Navigator & {
    globalPrivacyControl?: boolean;
  };
  if (navWithPrivacy.globalPrivacyControl === true) return false;
  if (navigator.doNotTrack === "1") return false;
  return true;
}

function readBrowserCookie(name: "_fbp" | "_fbc"): string | undefined {
  if (typeof document === "undefined" || !document.cookie) return undefined;
  const extracted = extractMetaIdentifiersFromCookieHeader(document.cookie);
  return name === "_fbp" ? extracted.fbp : extracted.fbc;
}

function writeFbcCookie(fbc: string): void {
  if (typeof document === "undefined") return;
  const maxAgeSeconds = 90 * 24 * 60 * 60; // 90 days per Meta specification
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `_fbc=${fbc}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

/**
 * If the current browser URL contains a real `?fbclid=...` query parameter and
 * cookies/tracking are permitted, capture it in Meta's standard `_fbc` format:
 * `fb.1.<creationTimeMs>.<fbclid>`. Does nothing when `fbclid` is absent.
 */
export function captureFbclidFromUrl(): string | undefined {
  if (!areTrackingCookiesPermittedInBrowser()) return undefined;
  if (typeof window === "undefined") return undefined;

  const fbclid = new URLSearchParams(window.location.search)
    .get("fbclid")
    ?.trim();
  if (!fbclid || !FBCLID_RE.test(fbclid)) return undefined;

  // Preserve original click creation timestamp if the exact same fbclid is already recorded
  const existing =
    readBrowserCookie("_fbc") ??
    (() => {
      try {
        return sanitizeMetaCookieId(
          window.sessionStorage.getItem(FBC_SESSION_STORAGE_KEY)
        );
      } catch {
        return undefined;
      }
    })();

  if (existing && existing.endsWith(`.${fbclid}`)) {
    writeFbcCookie(existing);
    return existing;
  }

  const fbc = sanitizeMetaCookieId(`fb.1.${Date.now()}.${fbclid}`);
  if (!fbc) return undefined;

  writeFbcCookie(fbc);
  try {
    window.sessionStorage.setItem(FBC_SESSION_STORAGE_KEY, fbc);
  } catch {
    // Ignore storage quota / private-browsing errors
  }
  return fbc;
}

/**
 * Read available genuine `_fbp` and `_fbc` identifiers in the browser.
 * Returns empty fields when unavailable or not permitted — never invents values.
 */
export function getMetaClickIdentifiers(): MetaClickIdentifiers {
  if (!areTrackingCookiesPermittedInBrowser()) return {};

  // Ensure any fbclid on the current URL (e.g. direct ad landing on /checkout) is captured first
  captureFbclidFromUrl();

  const fbp = readBrowserCookie("_fbp");
  let fbc = readBrowserCookie("_fbc");

  if (!fbc && typeof window !== "undefined") {
    try {
      fbc = sanitizeMetaCookieId(
        window.sessionStorage.getItem(FBC_SESSION_STORAGE_KEY)
      );
    } catch {
      // Ignore storage access errors
    }
  }

  return { fbp, fbc };
}
