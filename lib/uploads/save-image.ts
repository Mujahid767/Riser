import { randomBytes } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import type { MediaItem } from "@/lib/cms/types";
import cloudinary, { cloudinaryConfigured } from "@/lib/cloudinary";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED = new Set(["jpeg", "png", "webp", "gif", "avif"]);

export class UploadError extends Error {}

// ─── Shared: validate + pre-process with sharp ────────────────────────────────
async function processImage(file: File): Promise<{ buffer: Buffer; width: number; height: number }> {
  if (!file || file.size === 0) throw new UploadError("Choose a photo to upload.");
  if (file.size > MAX_BYTES) throw new UploadError("Photos must be 10 MB or smaller.");

  const input = Buffer.from(await file.arrayBuffer());
  const image = sharp(input, { failOn: "error", animated: false }).rotate();
  const meta = await image.metadata();

  if (!meta.format || !ALLOWED.has(meta.format)) {
    throw new UploadError("Upload a JPG, PNG, WEBP, GIF, or AVIF photo.");
  }

  // Resize to max 2400px on the longest side, convert to WebP quality 90 for crisp DSLR detail
  const buffer = await image
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 90, effort: 4 })
    .toBuffer();

  const info = await sharp(buffer).metadata();
  return { buffer, width: info.width ?? 0, height: info.height ?? 0 };
}

// ─── Cloudinary upload ─────────────────────────────────────────────────────────
async function uploadToCloudinary(buffer: Buffer, width: number, height: number): Promise<MediaItem> {
  const id = randomBytes(8).toString("hex");

  const result = await new Promise<{ secure_url: string; public_id: string; bytes: number }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: `riser/products/${id}`,
          folder: "riser",
          overwrite: false,
          // Tell Cloudinary the image is already WebP — no re-encoding
          resource_type: "image",
          // Automatically serve AVIF/WebP based on browser
          eager: [
            { quality: "auto", fetch_format: "auto", width: 1200, crop: "limit" },
            { quality: "auto", fetch_format: "auto", width: 600, crop: "limit" },
          ],
          eager_async: true,
          tags: ["riser-product"],
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Cloudinary upload failed"));
          resolve(result as typeof result & { bytes: number });
        }
      );
      stream.end(buffer);
    }
  );

  return {
    id,
    url: result.secure_url,
    filename: `${id}.webp`,
    width,
    height,
    bytes: result.bytes,
    createdAt: new Date().toISOString(),
    storage: "cloudinary",
    publicId: result.public_id,
  } as MediaItem;
}

// ─── Local disk fallback ────────────────────────────────────────────────────────
async function saveToLocalDisk(buffer: Buffer, width: number, height: number): Promise<MediaItem> {
  const id = randomBytes(8).toString("hex");
  const filename = `${id}.webp`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), buffer);

  return {
    id,
    url: `/uploads/${filename}`,
    filename,
    width,
    height,
    bytes: buffer.length,
    createdAt: new Date().toISOString(),
    storage: "local",
  } as MediaItem;
}

// ─── Public API ────────────────────────────────────────────────────────────────
export async function saveUploadedImage(file: File): Promise<MediaItem> {
  const { buffer, width, height } = await processImage(file);

  if (cloudinaryConfigured) {
    return uploadToCloudinary(buffer, width, height);
  }
  return saveToLocalDisk(buffer, width, height);
}

export async function deleteUploadedFile(item: MediaItem | string) {
  // Support both old string (filename) and new MediaItem
  if (typeof item === "string") {
    // Legacy: filename string
    const safeName = path.basename(item);
    if (!/^[\w.-]+\.webp$/.test(safeName)) return;
    await unlink(path.join(process.cwd(), "public", "uploads", safeName)).catch(() => undefined);
    return;
  }

  if (item.storage === "cloudinary" && item.publicId && cloudinaryConfigured) {
    await cloudinary.uploader.destroy(item.publicId).catch(() => undefined);
    return;
  }

  if (item.storage === "local" || item.url.startsWith("/uploads/")) {
    const safeName = path.basename(item.filename);
    if (!/^[\w.-]+\.webp$/.test(safeName)) return;
    await unlink(path.join(process.cwd(), "public", "uploads", safeName)).catch(() => undefined);
  }
}

export { cloudinaryConfigured };
