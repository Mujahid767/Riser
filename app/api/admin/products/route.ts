import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { listProducts, createProduct, getProduct, updateProduct, deleteProduct } from "@/lib/products/store";
import type { AdminProduct } from "@/lib/products/types";
import {
  collectProductCloudinaryUrls,
  diffNewProductImages,
  scheduleCloudinaryWarmup,
} from "@/lib/images/cloudinary-warm";

export const runtime = "nodejs";

// GET /api/admin/products?category=&status=
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const product = await getProduct(id);
    if (!product) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ product });
  }

  const products = await listProducts({
    category: searchParams.get("category") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    stock: (searchParams.get("stock") as "in" | "out" | "low") || undefined,
  });
  return NextResponse.json({ products });
}

// POST /api/admin/products — create
export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Partial<AdminProduct> | null;
  if (!body?.name?.trim() || !body?.category || body?.price == null) {
    return NextResponse.json({ error: "Name, category and price are required." }, { status: 400 });
  }

  const statusVal = (body.status ?? "active").toUpperCase();
  if (statusVal === "ACTIVE" && !body.imageUrl) {
    return NextResponse.json(
      { error: "Add a main photo before publishing, or save it as Draft." },
      { status: 400 }
    );
  }

  const slug = body.slug?.trim() ||
    body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const product = await createProduct({
    name: body.name.trim(),
    slug,
    category: body.category,
    department: body.department ?? (body.category.startsWith("adult") || body.category === "short-tops" ? "women" : "petite"),
    status: (body.status ?? "active").toUpperCase() as AdminProduct["status"],
    price: Number(body.price),
    compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
    imageUrl: body.imageUrl ?? "",
    secondaryImageUrl: body.secondaryImageUrl ?? "",
    images: body.images ?? [],
    imageFraming: body.imageFraming,
    colors: body.colors ?? [],
    sizes: body.sizes ?? [],
    sizePrices: body.sizePrices ?? {},
    sizeStock: body.sizeStock ?? {},
    fabric: body.fabric ?? "",
    description: body.description ?? "",
    editionBadge: body.editionBadge ?? "",
    isNew: body.isNew ?? true,
    isBestSeller: body.isBestSeller ?? false,
    isLimited: body.isLimited ?? false,
    isOnSale: body.isOnSale ?? false,
    tags: body.tags ?? [],
    stock: Number(body.stock ?? 0),
  });

  // New active product: warm every photo it was created with
  if (product.status === "active") {
    scheduleCloudinaryWarmup(collectProductCloudinaryUrls(product), `create ${product.id}`);
  }

  return NextResponse.json({ product }, { status: 201 });
}

// PUT /api/admin/products?id=xxx — update
export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const body = (await request.json().catch(() => null)) as Partial<AdminProduct> | null;
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const current = await getProduct(id);
  if (!current) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  const merged = { ...current, ...body };
  if ((merged.status ?? "ACTIVE").toUpperCase() === "ACTIVE" && !merged.imageUrl) {
    return NextResponse.json(
      { error: "Add a main photo before publishing, or save it as Draft." },
      { status: 400 }
    );
  }

  const product = await updateProduct(id, body);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  // Warm only photos that are new or replaced. Price/stock/name/description edits change no
  // image URLs, so nothing is warmed. A draft/archived product becoming active has never been
  // warmed, so all of its photos are warmed once on publish.
  if (product.status === "active") {
    const newUrls =
      current.status === "active"
        ? diffNewProductImages(current, product)
        : collectProductCloudinaryUrls(product);
    scheduleCloudinaryWarmup(newUrls, `update ${product.id}`);
  }

  return NextResponse.json({ product });
}

// DELETE /api/admin/products?id=xxx
export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const ok = await deleteProduct(id);
  if (!ok) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  return NextResponse.json({ ok: true });
}

