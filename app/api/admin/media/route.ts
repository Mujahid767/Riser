import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { addMedia, listMedia, removeMedia } from "@/lib/cms/store";
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

  const removed = await removeMedia(id);
  if (removed) await deleteUploadedFile(removed);
  return NextResponse.json({ ok: true });
}
