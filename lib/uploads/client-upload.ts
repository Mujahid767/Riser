import type { MediaItem } from "@/lib/cms/types";

const MAX_DIMENSION = 2400;
const OPTIMIZE_THRESHOLD_BYTES = 900 * 1024; // Optimize any image > 900 KB for fast crisp DSLR uploads

/**
 * Downscale large DSLR photos (e.g. 2-10 MB) in the browser to max 2400px @ 92% WebP.
 * Preserves sharp zoomable resolution (~0.5-1.3 MB) while staying well under any upload cap.
 */
async function optimizeDslrImage(file: File): Promise<File> {
  if (file.size <= OPTIMIZE_THRESHOLD_BYTES || file.type === "image/gif") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    bitmap.close();

    const encode = (mime: string, quality: number) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), mime, quality));

    let blob = await encode("image/webp", 0.9);
    let outMime = "image/webp";
    let outExt = "webp";

    // Browsers that don't support WebP canvas encoding fall back to PNG (often huge) or null
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) {
      const jpegBlob = await encode("image/jpeg", 0.9);
      if (jpegBlob && (!blob || jpegBlob.size < blob.size)) {
        blob = jpegBlob;
        outMime = "image/jpeg";
        outExt = "jpg";
      }
    }

    // Ensure huge 7-10+ MB DSLR shots never exceed Cloudinary's 10 MB free-tier upload cap
    if (blob && blob.size > 8 * 1024 * 1024) {
      const smaller = await encode(outMime, 0.82);
      if (smaller && smaller.size < blob.size) blob = smaller;
    }

    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.${outExt}`, { type: outMime });
  } catch {
    return file;
  }
}

type SignatureResponse =
  | { configured: false }
  | {
      configured: true;
      id: string;
      cloudName: string;
      apiKey: string;
      timestamp: number;
      signature: string;
      folder: string;
      publicId: string;
      tags: string;
      eager?: string;
      eagerAsync?: string;
    };

async function tryDirectCloudinaryUpload(file: File): Promise<MediaItem | null> {
  const sigRes = await fetch("/api/admin/media/signature", { method: "POST" });
  if (sigRes.status === 401) {
    throw new Error("Your admin session expired. Please sign in again.");
  }
  if (!sigRes.ok) return null;

  const sig = (await sigRes.json().catch(() => null)) as SignatureResponse | null;
  if (!sig || !sig.configured) return null;

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);
  form.append("public_id", sig.publicId);
  form.append("tags", sig.tags);
  if (sig.eager) {
    form.append("eager", sig.eager);
    form.append("eager_async", sig.eagerAsync ?? "true");
  }

  const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const cloudData = (await cloudRes.json().catch(() => ({}))) as {
    secure_url?: string;
    public_id?: string;
    width?: number;
    height?: number;
    bytes?: number;
    error?: { message?: string };
  };

  if (!cloudRes.ok || !cloudData.secure_url) {
    throw new Error(cloudData.error?.message || `Cloudinary rejected upload (HTTP ${cloudRes.status}).`);
  }

  const regRes = await fetch("/api/admin/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: sig.id,
      url: cloudData.secure_url,
      filename: `${sig.id}.webp`,
      width: cloudData.width ?? 0,
      height: cloudData.height ?? 0,
      bytes: cloudData.bytes ?? file.size,
      publicId: cloudData.public_id ?? sig.publicId,
    }),
  });
  const regData = (await regRes.json().catch(() => ({}))) as { error?: string; media?: MediaItem };
  if (!regRes.ok || !regData.media) {
    // Still return the Cloudinary asset even if library index write failed, or throw if session expired
    if (regRes.status === 401) throw new Error("Your admin session expired. Please sign in again.");
    return {
      id: sig.id,
      url: cloudData.secure_url,
      filename: `${sig.id}.webp`,
      width: cloudData.width ?? 0,
      height: cloudData.height ?? 0,
      bytes: cloudData.bytes ?? file.size,
      createdAt: new Date().toISOString(),
      storage: "cloudinary",
      publicId: cloudData.public_id ?? sig.publicId,
    };
  }
  return regData.media;
}

export async function uploadAdminImage(rawFile: File): Promise<MediaItem> {
  const file = await optimizeDslrImage(rawFile);

  // 1. Try direct browser -> Cloudinary upload first (bypasses server body limits)
  let directError: string | null = null;
  try {
    const direct = await tryDirectCloudinaryUpload(file);
    if (direct) return direct;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Direct upload failed";
    if (msg.includes("session expired")) throw err;
    directError = msg;
    console.warn("[upload] Direct Cloudinary upload failed, falling back to server:", msg);
  }

  // 2. Fallback: upload through server route (supports up to 20MB, handles Cloudinary via server SDK)
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/media", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { error?: string; media?: MediaItem };
  if (!res.ok || !data.media) {
    throw new Error(data.error || directError || `Upload failed (HTTP ${res.status}).`);
  }
  return data.media;
}
