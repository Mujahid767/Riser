import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { cloudinaryConfigured } from "@/lib/uploads/save-image";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  return NextResponse.json({
    storage: cloudinaryConfigured ? "cloudinary" : "local",
    cloudinaryConfigured,
  });
}

