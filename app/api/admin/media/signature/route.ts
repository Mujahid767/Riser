import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import cloudinary, { cloudinaryConfigured } from "@/lib/cloudinary";

export const runtime = "nodejs";

/**
 * Returns a signed upload payload so the admin browser can upload large DSLR photos
 * directly to Cloudinary without hitting server RAM or proxy body-size limits.
 */
export async function POST() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  if (!cloudinaryConfigured) {
    return NextResponse.json({ configured: false });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY!.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET!.trim();

  const id = randomBytes(8).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `riser/products/${id}`;
  const folder = "riser";
  const tags = "riser-product";

  const signature = cloudinary.utils.api_sign_request(
    { folder, public_id: publicId, tags, timestamp },
    apiSecret
  );

  return NextResponse.json({
    configured: true,
    id,
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    publicId,
    tags,
  });
}
