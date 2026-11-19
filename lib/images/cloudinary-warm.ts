import cloudinary, { cloudinaryConfigured } from "@/lib/cloudinary";
import {
  CLOUDINARY_EAGER_SPECS,
  CLOUDINARY_EAGER_WIDTHS,
  buildCloudinaryUrl,
  isCloudinaryUrl,
} from "./cloudinary";

const CLOUDINARY_PUBLIC_ID_RE =
  /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:[^/]+_[^/]+\/)*(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?(?:[?#].*)?$/i;

export function extractCloudinaryPublicId(url: string): string | null {
  const m = CLOUDINARY_PUBLIC_ID_RE.exec(url.trim());
  return m?.[1] ?? null;
}

/**
 * Trigger async eager generation (when Cloudinary API keys are configured) or
 * lightweight CDN edge warming for canonical responsive widths on product images.
 * Safe and non-fatal: never blocks or fails product/order workflows.
 */
export async function warmCloudinaryProductTransforms(
  urls: Array<string | null | undefined>,
  widths: readonly number[] = CLOUDINARY_EAGER_WIDTHS
): Promise<{ attempted: number; warmed: number }> {
  const uniqueUrls = Array.from(
    new Set(urls.filter((u): u is string => Boolean(u && isCloudinaryUrl(u))))
  );
  if (uniqueUrls.length === 0) return { attempted: 0, warmed: 0 };

  let attempted = 0;
  let warmed = 0;

  if (cloudinaryConfigured) {
    await Promise.allSettled(
      uniqueUrls.map(async (url) => {
        const publicId = extractCloudinaryPublicId(url);
        if (!publicId) return;
        attempted += 1;
        await cloudinary.uploader.explicit(publicId, {
          type: "upload",
          eager: CLOUDINARY_EAGER_SPECS,
          eager_async: true,
        });
        warmed += 1;
      })
    );
  }

  // Also pre-warm CDN POPs directly so the first storefront visitor receives a cache HIT
  const edgeTargets = uniqueUrls.flatMap((url) =>
    widths.map((w) => buildCloudinaryUrl(url, { width: w }))
  );

  await Promise.allSettled(
    edgeTargets.map(async (target) => {
      attempted += 1;
      const res = await fetch(target, {
        method: "GET",
        headers: {
          Accept: "image/webp,image/png,*/*",
          "User-Agent": "RiserStoreWarmup/1.0",
        },
        signal: AbortSignal.timeout(8000),
      });
      // Drain body cleanly to reuse sockets without retaining pixels
      await res.arrayBuffer().catch(() => null);
      if (res.ok) warmed += 1;
    })
  );

  return { attempted, warmed };
}
