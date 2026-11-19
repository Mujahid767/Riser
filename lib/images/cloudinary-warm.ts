import { after } from "next/server";
import cloudinary, { cloudinaryConfigured } from "@/lib/cloudinary";
import {
  CLOUDINARY_EAGER_SPECS,
  CLOUDINARY_EAGER_WIDTHS,
  buildCloudinaryUrl,
  isCloudinaryUrl,
} from "./cloudinary";

const CLOUDINARY_PUBLIC_ID_RE =
  /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:[^/]+_[^/]+\/)*(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?(?:[?#].*)?$/i;

/** A URL that warmed successfully is not requested again for this long (per server process). */
const WARM_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [1_000, 3_000];

const recentlyWarmed = new Map<string, number>();
const inFlight = new Set<string>();

export function extractCloudinaryPublicId(url: string): string | null {
  const m = CLOUDINARY_PUBLIC_ID_RE.exec(url.trim());
  return m?.[1] ?? null;
}

type ProductImageFields = {
  imageUrl?: string | null;
  secondaryImageUrl?: string | null;
  images?: Array<string | null | undefined> | null;
};

/** Unique, trimmed Cloudinary image URLs referenced by a product (main, hover, gallery). */
export function collectProductCloudinaryUrls(product: ProductImageFields | null | undefined): string[] {
  if (!product) return [];
  const all = [product.imageUrl, product.secondaryImageUrl, ...(product.images ?? [])];
  const out = new Set<string>();
  for (const u of all) {
    const trimmed = typeof u === "string" ? u.trim() : "";
    if (trimmed && isCloudinaryUrl(trimmed)) out.add(trimmed);
  }
  return Array.from(out);
}

/**
 * Cloudinary URLs present on `after` but not on `before`, i.e. photos that were newly
 * uploaded, replaced or added to the gallery. Reordering or editing other fields yields [].
 */
export function diffNewProductImages(
  before: ProductImageFields | null | undefined,
  after: ProductImageFields
): string[] {
  const previous = new Set(collectProductCloudinaryUrls(before));
  return collectProductCloudinaryUrls(after).filter((u) => !previous.has(u));
}

async function warmOneUrl(url: string, widths: readonly number[]): Promise<void> {
  if (cloudinaryConfigured) {
    const publicId = extractCloudinaryPublicId(url);
    if (publicId) {
      await cloudinary.uploader.explicit(publicId, {
        type: "upload",
        eager: CLOUDINARY_EAGER_SPECS,
        eager_async: true,
      });
    }
  }

  // Pre-warm CDN so the first storefront visitor gets an edge cache HIT
  for (const w of widths) {
    const target = buildCloudinaryUrl(url, { width: w });
    const res = await fetch(target, {
      method: "GET",
      headers: { Accept: "image/webp,image/png,*/*", "User-Agent": "RiserStoreWarmup/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    await res.arrayBuffer().catch(() => null);
    if (!res.ok) throw new Error(`HTTP ${res.status} warming ${target}`);
  }
}

async function warmWithRetry(url: string, widths: readonly number[]): Promise<Error | null> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await warmOneUrl(url, widths);
      return null;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, BACKOFF_MS[attempt - 1] ?? 3_000));
      }
    }
  }
  return lastError;
}

export type WarmResult = {
  requested: number;
  warmed: number;
  skipped: number;
  failed: Array<{ url: string; error: string }>;
};

/**
 * Warm canonical responsive transforms for the given Cloudinary URLs.
 * - Skips URLs warmed successfully within the TTL or currently in flight (no repeat requests).
 * - Retries transient failures (3 attempts with backoff); only successes are remembered.
 * - Never throws; failures are returned to the caller.
 */
export async function warmCloudinaryProductTransforms(
  urls: Array<string | null | undefined>,
  widths: readonly number[] = CLOUDINARY_EAGER_WIDTHS
): Promise<WarmResult> {
  const unique = Array.from(
    new Set(
      urls
        .map((u) => (typeof u === "string" ? u.trim() : ""))
        .filter((u) => u && isCloudinaryUrl(u))
    )
  );

  const now = Date.now();
  const result: WarmResult = { requested: unique.length, warmed: 0, skipped: 0, failed: [] };

  const todo = unique.filter((u) => {
    const at = recentlyWarmed.get(u);
    if ((at !== undefined && now - at < WARM_TTL_MS) || inFlight.has(u)) {
      result.skipped += 1;
      return false;
    }
    return true;
  });

  await Promise.all(
    todo.map(async (url) => {
      inFlight.add(url);
      try {
        const error = await warmWithRetry(url, widths);
        if (error) {
          result.failed.push({ url, error: error.message });
        } else {
          recentlyWarmed.set(url, Date.now());
          result.warmed += 1;
        }
      } finally {
        inFlight.delete(url);
      }
    })
  );

  return result;
}

/**
 * Run warming after the HTTP response using Next.js `after()`, which keeps the work alive
 * until it settles (unlike a floating promise). Failures are always logged, never silent.
 */
export function scheduleCloudinaryWarmup(urls: string[], reason: string): void {
  if (urls.length === 0) return;
  after(async () => {
    try {
      const res = await warmCloudinaryProductTransforms(urls);
      if (res.failed.length > 0) {
        console.error(
          `[cloudinary-warm] ${reason}: ${res.failed.length}/${res.requested} image(s) failed after ${MAX_ATTEMPTS} attempts`,
          res.failed
        );
      } else {
        console.info(
          `[cloudinary-warm] ${reason}: warmed=${res.warmed} skipped=${res.skipped} requested=${res.requested}`
        );
      }
    } catch (err) {
      console.error(`[cloudinary-warm] ${reason}: unexpected warmup failure`, err);
    }
  });
}
