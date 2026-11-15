import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/lib/coupons";

export const runtime = "nodejs";

async function requireAdmin() {
  const jar = await cookies();
  const session = jar.get("riser_admin_session")?.value;
  if (!session) return false;
  try {
    const data = JSON.parse(Buffer.from(session, "base64").toString("utf8"));
    return data?.role === "admin";
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const coupons = await listCoupons();
  return NextResponse.json({ coupons });
}

const createSchema = z.object({
  code: z.string().trim().min(2).max(30),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive().max(100000),
  minOrderAmount: z.number().nonnegative().optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  description: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Validation failed." },
      { status: 400 }
    );
  }
  try {
    const coupon = await createCoupon(parsed.data);
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "P2002") {
      return NextResponse.json(
        { error: "A coupon with this code already exists." },
        { status: 409 }
      );
    }
    throw err;
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const json = await request.json();
  const coupon = await updateCoupon(id, json);
  return NextResponse.json({ coupon });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await deleteCoupon(id);
  return NextResponse.json({ ok: true });
}
