import { NextResponse } from "next/server";
import { getSiteContent, saveSiteContent } from "@/lib/cms/store";
import { getAdminSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  return NextResponse.json({ content: await getSiteContent() });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { content?: unknown } | null;
  if (!body?.content || typeof body.content !== "object") {
    return NextResponse.json({ error: "Missing page content." }, { status: 400 });
  }

  try {
    const content = await saveSiteContent(body.content);
    return NextResponse.json({ content });
  } catch (err) {
    console.error("[admin/content] save failed", err);
    return NextResponse.json(
      { error: "Could not save content changes to the database. Please try again." },
      { status: 500 }
    );
  }
}
