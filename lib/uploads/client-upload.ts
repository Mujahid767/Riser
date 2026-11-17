import type { MediaItem } from "@/lib/cms/types";

const MAX_DIMENSION = 2400;
const OPTIMIZE_THRESHOLD_BYTES = 1 * 1024 * 1024; // 1 MB

/**
 * Downscale huge DSLR photos (e.g. 7-10 MB) in the browser to max 2400px @ 92% WebP.
 * Keeps crisp zoomable detail while cutting upload size to ~0.7-1.4 MB so it never hits
 * Cloudinary's 10 MB free-tier cap or server/proxy limits.
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

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", 0.92)
    );
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
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
    };

export async function uploadAdminImage(rawFile: File): Promise<MediaItem> {
  const file = await optimizeDslrImage(rawFile);

  // 1. Check if Cloudinary signed direct upload is available
  const sigRes = await fetch("/api/admin/media/signature", { method: "POST" });
  const sig = (await sigRes.json().catch(() => null)) as (SignatureResponse & { error?: string }) | null;

  if (sigRes.status === 401) {
    throw new Error("Your admin session expired. Please sign in again.");
  }

  if (sig && sig.configured) {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);
    form.append("public_id", sig.publicId);
    form.append("tags", sig.tags);

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
      throw new Error(cloudData.error?.message || "Cloudinary upload failed.");
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
      throw new Error(regData.error || "Uploaded to Cloudinary, but failed to save to library.");
    }
    return regData.media;
  }

  // 2. Fallback: server upload via FormData
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/media", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { error?: string; media?: MediaItem };
  if (!res.ok || !data.media) {
    throw new Error(data.error || `Upload failed (HTTP ${res.status}).`);
  }
  return data.media;
}
