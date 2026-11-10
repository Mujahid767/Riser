import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { addMedia, listMedia, removeMedia } from "@/lib/cms/store";
import { deleteUploadedFile, saveUploadedImage, UploadError } from "@/lib/uploads/save-image";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  return NextResponse.json({ media: await listMedia() });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

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
  if (removed) await deleteUploadedFile(removed.filename);
  return NextResponse.json({ ok: true });
}
