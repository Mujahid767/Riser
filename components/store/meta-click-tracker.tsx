"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureFbclidFromUrl } from "@/lib/analytics/fb-cookies";

/**
 * Captures an authentic `fbclid` URL parameter into the `_fbc` cookie/session
 * when a customer lands on any storefront page from a Meta ad click.
 */
export default function MetaClickTracker() {
  const pathname = usePathname();

  useEffect(() => {
    captureFbclidFromUrl();
  }, [pathname]);

  return null;
}
