import type { ImageLoaderProps } from "next/image";

/**
 * Canonical eager widths aligned with Next.js deviceSizes/imageSizes breakpoints:
 * - 256: gallery thumbnails, cart items, checkout mini thumbnails (retina 2x-3x)
 * - 640: shop grid product cards (mobile 50vw & desktop 25vw @ 2x)
 * - 1024: product detail stage (desktop 55vw & mobile full-width @ 2x)
 */
export const CLOUDINARY_EAGER_WIDTHS = [256, 640, 1024] as const;

export const CLOUDINARY_EAGER_SPECS = CLOUDINARY_EAGER_WIDTHS.map((width) => ({
  width,
  crop: "limit" as const,
  fetch_format: "auto" as const,
  quality: "auto" as const,
}));

/** Canonical pipe-delimited string accepted by Cloudinary signed upload `eager` param */
export const CLOUDINARY_EAGER_PARAM = CLOUDINARY_EAGER_WIDTHS.map(
  (w) => `c_limit,f_auto,q_auto,w_${w}`
).join("|");

const CLOUDINARY_UPLOAD_RE =
  /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/i;

const VERSION_SEGMENT_RE = /^v\d+$/;
const TRANSFORM_TOKEN_RE = /^(?:w|h|c|f|q|dpr|ar|g|e|t|fl|bo|b|r|u|l|o|z|a|cs)_/i;
const OVERRIDDEN_PREFIX_RE = /^(?:w|c|f|q)_/i;

export function isCloudinaryUrl(src: string): boolean {
  if (!src) return false;
  return CLOUDINARY_UPLOAD_RE.test(src.trim());
}

function resolveCloudinaryQuality(quality?: number): string {
  if (quality === undefined || quality === 75) return "q_auto";
  if (quality >= 90) return "q_auto:best";
  if (quality <= 50) return "q_auto:eco";
  return "q_auto";
}

function isTransformSegment(segment: string): boolean {
  if (!segment || VERSION_SEGMENT_RE.test(segment)) return false;
  return segment.split(",").every((token) => TRANSFORM_TOKEN_RE.test(token));
}

/**
 * Inject canonical responsive Cloudinary delivery parameters (`w_`, `c_limit`, `f_auto`, `q_auto`)
 * while preserving the existing stored version and public_id in Neon without altering DB URLs.
 */
export function buildCloudinaryUrl(
  src: string,
  { width, quality }: { width: number; quality?: number }
): string {
  const trimmed = src.trim();
  const match = CLOUDINARY_UPLOAD_RE.exec(trimmed);
  if (!match) return src;

  const [, basePrefix, tailWithQuery] = match;
  const queryIdx = tailWithQuery.indexOf("?");
  const hashIdx = tailWithQuery.indexOf("#");
  const splitIdx =
    queryIdx >= 0 && hashIdx >= 0
      ? Math.min(queryIdx, hashIdx)
      : Math.max(queryIdx, hashIdx);

  const pathPart = splitIdx >= 0 ? tailWithQuery.slice(0, splitIdx) : tailWithQuery;
  const suffix = splitIdx >= 0 ? tailWithQuery.slice(splitIdx) : "";

  const segments = pathPart.split("/").filter(Boolean);
  if (segments.length === 0) return src;

  // Preserve non-conflicting leading transforms (if any) and strip duplicate w_/c_/f_/q_ tokens
  const preservedTransforms: string[] = [];
  let assetStartIndex = 0;

  while (assetStartIndex < segments.length - 1 && isTransformSegment(segments[assetStartIndex])) {
    const cleanedTokens = segments[assetStartIndex]
      .split(",")
      .filter((token) => !OVERRIDDEN_PREFIX_RE.test(token));
    if (cleanedTokens.length > 0) {
      preservedTransforms.push(cleanedTokens.join(","));
    }
    assetStartIndex += 1;
  }

  const safeWidth = Math.max(1, Math.min(3840, Math.round(width || 640)));
  const qParam = resolveCloudinaryQuality(quality);
  const canonicalSegment = `c_limit,f_auto,${qParam},w_${safeWidth}`;

  const assetSegments = segments.slice(assetStartIndex);
  const rebuiltPath = [
    ...preservedTransforms,
    canonicalSegment,
    ...assetSegments,
  ].join("/");

  return `${basePrefix}${rebuiltPath}${suffix}`;
}

export default function cloudinaryImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!isCloudinaryUrl(src)) {
    return src;
  }
  return buildCloudinaryUrl(src, { width, quality });
}
