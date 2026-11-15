import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/products/batch?ids=id1,id2,id3 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50); // max 50 at once

  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const rows = await prisma.product.findMany({
    where: { id: { in: ids }, status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      compareAtPrice: true,
      imageUrl: true,
      sizes: true,
      stock: true,
    },
  });

  const products = rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.basePrice.toString()),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice.toString()) : null,
    imageUrl: p.imageUrl,
    sizes: Array.isArray(p.sizes) ? (p.sizes as string[]) : [],
    stock: p.stock,
  }));

  return NextResponse.json({ products });
}
