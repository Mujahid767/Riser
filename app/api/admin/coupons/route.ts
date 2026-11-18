import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/session";
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from "@/lib/coupons";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const coupons = await listCoupons();
  return NextResponse.json({ coupons });
}

const createSchema = z
  .object({
    code: z.string().trim().min(2).max(30),
    type: z.enum(["PERCENT", "FIXED"]),
    value: z.number().positive().max(100000),
    minOrderAmount: z.number().nonnegative().optional().nullable(),
    maxUses: z.number().int().positive().optional().nullable(),
    expiresAt: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid expiry date.")
      .optional()
      .nullable(),
    description: z.string().max(200).optional(),
  })
  .refine((d) => d.type !== "PERCENT" || d.value <= 100, {
    message: "Percentage discount cannot exceed 100%.",
    path: ["value"],
  });

const patchSchema = z
  .object({
    active: z.boolean().optional(),
    maxUses: z.number().int().positive().nullable().optional(),
    expiresAt: z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid expiry date.")
      .nullable()
      .optional(),
    description: z.string().max(200).nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one valid field to update.",
  });

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
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
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid coupon update." },
      { status: 400 }
    );
  }

  try {
    const coupon = await updateCoupon(id, {
      ...parsed.data,
      description: parsed.data.description ?? undefined,
    });
    return NextResponse.json({ coupon });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "P2025") {
      return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await deleteCoupon(id);
  return NextResponse.json({ ok: true });
}
