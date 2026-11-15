import { NextResponse } from "next/server";
import { z } from "zod";
import { validateCoupon } from "@/lib/coupons";

export const runtime = "nodejs";

const schema = z.object({
  code: z.string().trim().min(1).max(50),
  subtotal: z.number().int().nonnegative(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = await validateCoupon(parsed.data.code, parsed.data.subtotal);

  if (!result.valid) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    code: result.code,
    type: result.type,
    value: result.value,
    discount: result.discount,
  });
}
