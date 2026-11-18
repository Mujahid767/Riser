"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/analytics";
import { captureFbclidFromUrl } from "@/lib/analytics/fb-cookies";

/**
 * Storefront-only client route listener.
 * Captures `?fbclid=` click params and fires GA4/Meta `PageView` ONLY on
 * subsequent SPA route transitions (initial load PageView is emitted once by
 * the bootstrap Script in `app/(store)/layout.tsx`).
 */
export default function StoreTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    captureFbclidFromUrl();

    const qs = searchParams?.toString();
    const currentUrl = qs ? `${pathname}?${qs}` : pathname;

    // Skip initial mount because the storefront bootstrap Script fires the first PageView
    if (lastTrackedUrlRef.current === null) {
      lastTrackedUrlRef.current = currentUrl;
      return;
    }

    if (lastTrackedUrlRef.current === currentUrl) return;
    lastTrackedUrlRef.current = currentUrl;
    analytics.pageView(currentUrl);
  }, [pathname, searchParams]);

  return null;
}
