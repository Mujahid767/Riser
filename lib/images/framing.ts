import type { CSSProperties } from "react";

export type ImageAspectRatio = "3:4" | "4:5" | "original";
export type ImageDisplayMode = "crop" | "fit";

export interface CropAreaPercent {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageFraming {
  mode: ImageDisplayMode;
  aspectRatio: ImageAspectRatio;
  cropArea?: CropAreaPercent;
  crop?: { x: number; y: number };
  zoom?: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

export type ProductImageFramingMap = Record<string, ImageFraming>;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function getNumericAspectRatio(
  ratio: ImageAspectRatio,
  naturalWidth?: number,
  naturalHeight?: number
): number {
  if (ratio === "4:5") return 4 / 5;
  if (ratio === "original" && naturalWidth && naturalHeight && naturalWidth > 0 && naturalHeight > 0) {
    return naturalWidth / naturalHeight;
  }
  return 3 / 4;
}

export function normalizeSingleFraming(raw: unknown): ImageFraming | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const src = raw as Record<string, unknown>;

  const mode: ImageDisplayMode = src.mode === "fit" ? "fit" : "crop";
  const aspectRatio: ImageAspectRatio =
    src.aspectRatio === "4:5" || src.aspectRatio === "original" ? src.aspectRatio : "3:4";

  let cropArea: CropAreaPercent | undefined;
  if (src.cropArea && typeof src.cropArea === "object" && !Array.isArray(src.cropArea)) {
    const ca = src.cropArea as Record<string, unknown>;
    const x = Number(ca.x);
    const y = Number(ca.y);
    const width = Number(ca.width);
    const height = Number(ca.height);
    if (
      Number.isFinite(x) &&
      Number.isFinite(y) &&
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width > 0 &&
      height > 0
    ) {
      const safeW = clamp(round3(width), 1, 100);
      const safeH = clamp(round3(height), 1, 100);
      cropArea = {
        x: clamp(round3(x), 0, 100 - safeW),
        y: clamp(round3(y), 0, 100 - safeH),
        width: safeW,
        height: safeH,
      };
    }
  }

  let crop: { x: number; y: number } | undefined;
  if (src.crop && typeof src.crop === "object" && !Array.isArray(src.crop)) {
    const c = src.crop as Record<string, unknown>;
    const cx = Number(c.x);
    const cy = Number(c.y);
    if (Number.isFinite(cx) && Number.isFinite(cy)) {
      crop = { x: round3(cx), y: round3(cy) };
    }
  }

  const rawZoom = Number(src.zoom);
  const zoom = Number.isFinite(rawZoom) && rawZoom >= 1 ? clamp(round3(rawZoom), 1, 5) : undefined;

  const rawNatW = Number(src.naturalWidth);
  const rawNatH = Number(src.naturalHeight);
  const naturalWidth =
    Number.isFinite(rawNatW) && rawNatW > 0 ? Math.round(rawNatW) : undefined;
  const naturalHeight =
    Number.isFinite(rawNatH) && rawNatH > 0 ? Math.round(rawNatH) : undefined;

  return {
    mode,
    aspectRatio,
    ...(cropArea ? { cropArea } : {}),
    ...(crop ? { crop } : {}),
    ...(zoom !== undefined ? { zoom } : {}),
    ...(naturalWidth && naturalHeight ? { naturalWidth, naturalHeight } : {}),
  };
}

export function normalizeImageFramingMap(
  raw: unknown,
  allowedUrls?: Array<string | null | undefined>
): ProductImageFramingMap {
  const out: ProductImageFramingMap = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;

  const allowedSet = allowedUrls
    ? new Set(
        allowedUrls
          .map((u) => (typeof u === "string" ? u.trim() : ""))
          .filter(Boolean)
      )
    : null;

  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    const cleanUrl = key.trim();
    if (!cleanUrl) continue;
    if (allowedSet && !allowedSet.has(cleanUrl)) continue;
    const normalized = normalizeSingleFraming(val);
    if (normalized) {
      out[cleanUrl] = normalized;
    }
  }

  return out;
}

export type FramedLayoutResult =
  | { mode: "default" }
  | { mode: "fit" }
  | { mode: "crop"; wrapperStyle: CSSProperties; widthMultiplier: number };

/**
 * Computes zero-distortion CSS positioning & scale percentages from saved
 * `react-easy-crop` percentage coordinates so storefront cards & previews
 * render exact framing using canonical Cloudinary URLs (no extra transforms).
 */
export function computeFramedCropLayout(
  framing?: ImageFraming | null,
  containerAspect = 3 / 4
): FramedLayoutResult {
  if (!framing) return { mode: "default" };
  if (framing.mode === "fit") return { mode: "fit" };

  const ca = framing.cropArea;
  if (!ca || ca.width <= 0 || ca.height <= 0) {
    return { mode: "default" };
  }

  const wFrac = clamp(ca.width / 100, 0.01, 1);
  const hFrac = clamp(ca.height / 100, 0.01, 1);
  const cx = clamp((ca.x + ca.width / 2) / 100, 0, 1);
  const cy = clamp((ca.y + ca.height / 2) / 100, 0, 1);

  const safeContainerAspect = containerAspect > 0 ? containerAspect : 3 / 4;
  let naturalRatio: number;

  if (
    framing.naturalWidth &&
    framing.naturalHeight &&
    framing.naturalWidth > 0 &&
    framing.naturalHeight > 0
  ) {
    naturalRatio = framing.naturalWidth / framing.naturalHeight;
  } else {
    const selectedAspect = getNumericAspectRatio(framing.aspectRatio);
    naturalRatio = selectedAspect * (hFrac / wFrac);
  }

  const cropRatio = (wFrac / hFrac) * naturalRatio;

  let wPct: number;
  let hPct: number;

  if (cropRatio <= safeContainerAspect) {
    wPct = 100 / wFrac;
    hPct = wPct * (safeContainerAspect / naturalRatio);
  } else {
    hPct = 100 / hFrac;
    wPct = hPct * (naturalRatio / safeContainerAspect);
  }

  // Guard against floating-point underfill
  if (wPct < 100) {
    const factor = 100 / wPct;
    wPct *= factor;
    hPct *= factor;
  }
  if (hPct < 100) {
    const factor = 100 / hPct;
    wPct *= factor;
    hPct *= factor;
  }

  const leftPct = clamp(50 - cx * wPct, 100 - wPct, 0);
  const topPct = clamp(50 - cy * hPct, 100 - hPct, 0);

  return {
    mode: "crop",
    widthMultiplier: wPct / 100,
    wrapperStyle: {
      position: "absolute",
      left: `${round3(leftPct)}%`,
      top: `${round3(topPct)}%`,
      width: `${round3(wPct)}%`,
      height: `${round3(hPct)}%`,
    },
  };
}

export function resolveFramingSizes(
  baseSizes: string,
  layout: FramedLayoutResult
): string {
  if (layout.mode !== "crop" || layout.widthMultiplier < 1.55) {
    return baseSizes;
  }
  return "(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw";
}
