"use client";

import Image, { type ImageProps } from "next/image";
import cloudinaryImageLoader, { isCloudinaryUrl } from "@/lib/images/cloudinary";

/**
 * Drop-in replacement for next/image across storefront routes:
 * - Cloudinary URLs use direct Cloudinary CDN delivery (w_, c_limit, f_auto, q_auto)
 *   via Next.js custom loader without proxying through /_next/image.
 * - Non-Cloudinary images (/uploads/*, Unsplash, etc.) keep using Next's optimizer cleanly.
 */
export default function RiserImage(props: ImageProps) {
  const { loader, unoptimized, alt, ...rest } = props;
  const srcStr = typeof props.src === "string" ? props.src : "";
  const resolvedLoader =
    loader ?? (!unoptimized && isCloudinaryUrl(srcStr) ? cloudinaryImageLoader : undefined);

  return <Image {...rest} alt={alt ?? ""} unoptimized={unoptimized} loader={resolvedLoader} />;
}
