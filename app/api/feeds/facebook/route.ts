import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toAbsoluteUrl(url: string, baseUrl: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://riser.com.bd";

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      NOT: { imageUrl: "" },
    },
    orderBy: { createdAt: "desc" },
  });

  const itemsXml = products
    .map((p) => {
      const priceVal = Number(p.basePrice).toFixed(2);
      const inStock = p.stock > 0;
      const productUrl = `${baseUrl}/product/${p.slug}`;
      const desc = p.description || `${p.name} - Handcrafted premium wear by Riser Atelier.`;
      const mainImage = toAbsoluteUrl(p.imageUrl, baseUrl);

      let additionalImages = "";
      if (Array.isArray(p.galleryImages)) {
        additionalImages = (p.galleryImages as string[])
          .slice(0, 5)
          .map((img) => `      <g:additional_image_link>${escapeXml(toAbsoluteUrl(img, baseUrl))}</g:additional_image_link>`)
          .join("\n");
      }

      return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.name)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(mainImage)}</g:image_link>
${additionalImages ? additionalImages + "\n" : ""}      <g:brand>Riser</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${inStock ? "in stock" : "out of stock"}</g:availability>
      <g:price>${priceVal} BDT</g:price>
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing &gt; Dresses</g:google_product_category>
      <g:fb_product_category>clothing</g:fb_product_category>
      <g:custom_label_0>${escapeXml(p.category || "dresses")}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(p.department || "kids")}</g:custom_label_1>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Riser Atelier Facebook Product Feed</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Live product catalog data feed for Meta Commerce Manager and Dynamic Product Ads (DPA)</description>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
