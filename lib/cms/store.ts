import { cache } from "react";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import prisma from "@/lib/db";
import { defaultSiteContent } from "./defaults";
import { sanitizeContent } from "./sanitize";
import type { CmsStore, MediaItem, SiteContent } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "cms.json");

let writeQueue: Promise<unknown> = Promise.resolve();

function withLock<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readStore(): Promise<CmsStore> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<CmsStore>;
    return {
      content: sanitizeContent(parsed.content ?? defaultSiteContent),
      media: Array.isArray(parsed.media) ? parsed.media.filter(isMediaItem) : [],
    };
  } catch {
    return { content: defaultSiteContent, media: [] };
  }
}

function isMediaItem(value: unknown): value is MediaItem {
  if (!value || typeof value !== "object") return false;
  const item = value as MediaItem;
  return (
    typeof item.id === "string" &&
    typeof item.url === "string" &&
    typeof item.filename === "string" &&
    (item.url.startsWith("/uploads/") || item.url.startsWith("https://"))
  );
}

async function writeStore(store: CmsStore) {
  await mkdir(DATA_DIR, { recursive: true });
  const temp = `${STORE_FILE}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(store, null, 2), "utf8");
  await rename(temp, STORE_FILE);
}

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  try {
    const row = await prisma.cmsContent.findUnique({ where: { id: "site_content" } });
    if (row && row.data && typeof row.data === "object") {
      return sanitizeContent(row.data);
    }
  } catch {
    // Database offline or during migration fallback
  }

  const store = await readStore();
  return store.content;
});

export async function listMedia(): Promise<MediaItem[]> {
  try {
    const rows = await prisma.mediaItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        url: r.url,
        filename: r.filename,
        width: r.width,
        height: r.height,
        bytes: r.bytes,
        createdAt: r.createdAt.toISOString(),
        storage: (r.storage === "cloudinary" ? "cloudinary" : "local") as MediaItem["storage"],
        publicId: r.publicId ?? undefined,
      }));
    }
  } catch (e) {
    console.error("[cms] failed to list media from database", e);
  }

  const store = await readStore();
  return [...store.media].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveSiteContent(input: unknown): Promise<SiteContent> {
  return withLock(async () => {
    const sanitized = sanitizeContent(input);

    // 1. Persist to PostgreSQL database (survives all cloud deployments)
    try {
      await prisma.cmsContent.upsert({
        where: { id: "site_content" },
        create: { id: "site_content", data: sanitized as never },
        update: { data: sanitized as never },
      });
    } catch (e) {
      console.error("[cms] failed to save to database", e);
    }

    // 2. Also persist to local file store
    try {
      const store = await readStore();
      store.content = sanitized;
      await writeStore(store);
    } catch {
      // Ephemeral disk in serverless
    }

    return sanitized;
  });
}

export async function addMedia(item: MediaItem): Promise<MediaItem> {
  return withLock(async () => {
    await prisma.mediaItem.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        url: item.url,
        filename: item.filename,
        width: item.width ?? 0,
        height: item.height ?? 0,
        bytes: item.bytes ?? 0,
        storage: item.storage ?? "local",
        publicId: item.publicId ?? null,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      },
      update: {
        url: item.url,
        filename: item.filename,
        width: item.width ?? 0,
        height: item.height ?? 0,
        bytes: item.bytes ?? 0,
        storage: item.storage ?? "local",
        publicId: item.publicId ?? null,
      },
    });

    // Best-effort local file sync; never fail the request on ephemeral cloud filesystems
    try {
      const store = await readStore();
      store.media.unshift(item);
      await writeStore(store);
    } catch {
      // Ephemeral/read-only disk on Railway/Vercel
    }

    return item;
  });
}

export async function removeMedia(id: string): Promise<MediaItem | null> {
  return withLock(async () => {
    let removed: MediaItem | null = null;

    try {
      const existing = await prisma.mediaItem.findUnique({ where: { id } });
      if (existing) {
        await prisma.mediaItem.delete({ where: { id } });
        removed = {
          id: existing.id,
          url: existing.url,
          filename: existing.filename,
          width: existing.width,
          height: existing.height,
          bytes: existing.bytes,
          createdAt: existing.createdAt.toISOString(),
          storage: (existing.storage === "cloudinary" ? "cloudinary" : "local") as MediaItem["storage"],
          publicId: existing.publicId ?? undefined,
        };
      }
    } catch (e) {
      console.error("[cms] failed to delete media from database", e);
    }

    try {
      const store = await readStore();
      const localItem = store.media.find((entry) => entry.id === id) ?? null;
      if (!removed) removed = localItem;
      store.media = store.media.filter((entry) => entry.id !== id);
      await writeStore(store);
    } catch {
      // Ephemeral/read-only disk on Railway/Vercel
    }

    return removed;
  });
}
