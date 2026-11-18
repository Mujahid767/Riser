import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAdminSession } from "@/lib/auth/session";
import { addMedia, getMediaById, getSiteContent, listMedia, removeMedia } from "@/lib/cms/store";
import { deleteUploadedFile, saveUploadedImage, UploadError } from "@/lib/uploads/save-image";
import type { MediaItem } from "@/lib/cms/types";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  return NextResponse.json({ media: await listMedia() });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const contentType = request.headers.get("content-type") || "";

  // Direct Cloudinary upload registers metadata as JSON
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as Partial<MediaItem> | null;
    if (!body?.id || !body?.url || !body.url.startsWith("https://res.cloudinary.com/")) {
      return NextResponse.json({ error: "Invalid Cloudinary media payload." }, { status: 400 });
    }
    const item: MediaItem = {
      id: String(body.id),
      url: String(body.url),
      filename: String(body.filename || `${body.id}.webp`),
      width: Number(body.width) || 0,
      height: Number(body.height) || 0,
      bytes: Number(body.bytes) || 0,
      createdAt: new Date().toISOString(),
      storage: "cloudinary",
      publicId: body.publicId ? String(body.publicId) : undefined,
    };
    await addMedia(item);
    return NextResponse.json({ media: item });
  }

  // Fallback: FormData upload through server
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
  }

  try {
    const item = await saveUploadedImage(file);
    await addMedia(item);
    return NextResponse.json({ media: item });
  } catch (error) {
    const message = error instanceof UploadError ? error.message : "Could not process that photo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing photo id." }, { status: 400 });

  const existing = await getMediaById(id);
  if (!existing) return NextResponse.json({ ok: true });

  // Prevent breaking live products or CMS banners that still reference this image URL
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      imageUrl: true,
      secondaryImageUrl: true,
      galleryImages: true,
    },
  });
  const usedByProducts = products.filter((p) => {
    const gallery = Array.isArray(p.galleryImages) ? (p.galleryImages as unknown[]) : [];
    return (
      p.imageUrl === existing.url ||
      p.secondaryImageUrl === existing.url ||
      gallery.includes(existing.url)
    );
  });

  if (usedByProducts.length > 0) {
    const names = usedByProducts
      .slice(0, 3)
      .map((p) => p.name)
      .join(", ");
    const suffix = usedByProducts.length > 3 ? ` (+${usedByProducts.length - 3} more)` : "";
    return NextResponse.json(
      {
        error: `Cannot delete this photo because it is still used by ${usedByProducts.length} product(s): ${names}${suffix}. Replace or remove it from those products first.`,
      },
      { status: 409 }
    );
  }

  const content = await getSiteContent();
  const usedInCms =
    content.hero.some((h) => h.image === existing.url) ||
    content.categories.cards.some((c) => c.image === existing.url) ||
    content.seasonal.image === existing.url ||
    content.brand.image === existing.url;
  if (usedInCms) {
    return NextResponse.json(
      {
        error:
          "Cannot delete this photo because it is currently used on your storefront homepage content. Replace it in Page Content first.",
      },
      { status: 409 }
    );
  }

  const removed = await removeMedia(id);
  if (removed) await deleteUploadedFile(removed);
  return NextResponse.json({ ok: true });
}
