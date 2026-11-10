import { randomBytes } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import type { MediaItem } from "@/lib/cms/types";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["jpeg", "png", "webp", "gif", "avif"]);

export class UploadError extends Error {}

export async function saveUploadedImage(file: File): Promise<MediaItem> {
  if (!file || file.size === 0) throw new UploadError("Choose a photo to upload.");
  if (file.size > MAX_BYTES) throw new UploadError("Photos must be 8 MB or smaller.");

  const input = Buffer.from(await file.arrayBuffer());
  const image = sharp(input, { failOn: "error", animated: false }).rotate();
  const meta = await image.metadata();
  if (!meta.format || !ALLOWED.has(meta.format)) {
    throw new UploadError("Upload a JPG, PNG, WEBP, GIF, or AVIF photo.");
  }

  const output = await image
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const info = await sharp(output).metadata();
  const id = randomBytes(8).toString("hex");
  const filename = `${id}.webp`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), output);

  return {
    id,
    url: `/uploads/${filename}`,
    filename,
    width: info.width ?? 0,
    height: info.height ?? 0,
    bytes: output.length,
    createdAt: new Date().toISOString(),
  };
}

export async function deleteUploadedFile(filename: string) {
  const safeName = path.basename(filename);
  if (!/^[\w.-]+\.webp$/.test(safeName)) return;
  await unlink(path.join(process.cwd(), "public", "uploads", safeName)).catch(() => undefined);
}
