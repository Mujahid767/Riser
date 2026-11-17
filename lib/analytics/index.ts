/**
 * lib/analytics/index.ts
 * Phase 4: Unified client-side analytics — GA4 + Meta Pixel.
 * Each event carries a unique eventId that matches the server-side CAPI call,
 * preventing Meta from double-counting browser + server events.
 */

type EventValue = string | number | boolean | string[] | undefined;
type EventProperties = Record<string, EventValue>;

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
    dataLayer: unknown[];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gtagEvent(eventName: string, params?: EventProperties): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}

/**
 * Fire a Meta Pixel event with a stable eventId for deduplication.
 * Pass the same eventId to the server-side CAPI call.
 */
function fbEvent(
  eventName: string,
  params?: EventProperties,
  eventId?: string
): void {
  if (typeof window === "undefined" || !window.fbq) return;
  if (eventId) {
    window.fbq("track", eventName, params, { eventID: eventId });
  } else {
    window.fbq("track", eventName, params);
  }
}

function fbCustomEvent(
  eventName: string,
  params?: EventProperties,
  eventId?: string
): void {
  if (typeof window === "undefined" || !window.fbq) return;
  if (eventId) {
    window.fbq("trackCustom", eventName, params, { eventID: eventId });
  } else {
    window.fbq("trackCustom", eventName, params);
  }
}

// ─── Unified Analytics Events ─────────────────────────────────────────────────

export const analytics = {
  /** Page view — called by route-change listener in layout */
  pageView(url: string): void {
    gtagEvent("page_view", { page_path: url });
    fbEvent("PageView");
  },

  /**
   * Product page viewed.
   * eventId = `vc-${productId}` — same string must be sent in CAPI.
   */
  viewContent(params: {
    productId: string;
    productName: string;
    category?: string;
    price?: number;
  }): void {
    const eventId = `vc-${params.productId}-${Date.now()}`;
    gtagEvent("view_item", {
      item_id: params.productId,
      item_name: params.productName,
      item_category: params.category,
      price: params.price,
      currency: "BDT",
    });
    fbEvent(
      "ViewContent",
      {
        content_ids: [params.productId],
        content_type: "product",
        content_name: params.productName,
        content_category: params.category,
        value: params.price,
        currency: "BDT",
      },
      eventId
    );
  },

  /** Product added to cart */
  addToCart(params: {
    productId: string;
    productName: string;
    variant?: string;
    price: number;
    quantity: number;
  }): void {
    const eventId = `atc-${params.productId}-${Date.now()}`;
    gtagEvent("add_to_cart", {
      item_id: params.productId,
      item_name: params.productName,
      item_variant: params.variant,
      price: params.price,
      quantity: params.quantity,
      currency: "BDT",
    });
    fbEvent(
      "AddToCart",
      {
        content_ids: [params.productId],
        content_type: "product",
        content_name: params.productName,
        value: params.price * params.quantity,
        currency: "BDT",
      },
      eventId
    );
  },

  /** Customer started checkout */
  initiateCheckout(params: { totalValue: number; itemCount: number }): void {
    gtagEvent("begin_checkout", {
      value: params.totalValue,
      currency: "BDT",
    });
    fbEvent("InitiateCheckout", {
      value: params.totalValue,
      currency: "BDT",
      num_items: params.itemCount,
    });
  },

  /**
   * COD order submitted (unverified, unpaid — NEVER fire Purchase here).
   * eventId = `cod-${orderNumber}` — matches the server CAPI event for deduplication.
   */
  codOrderPlaced(params: {
    orderNumber: string;
    total: number;
    itemCount: number;
    productIds?: string[];
  }): void {
    const eventId = `cod-${params.orderNumber}`;
    gtagEvent("cod_order_placed", {
      transaction_id: params.orderNumber,
      value: params.total,
      currency: "BDT",
    });
    fbCustomEvent(
      "CODOrderPlaced",
      {
        order_id: params.orderNumber,
        value: params.total,
        currency: "BDT",
        num_items: params.itemCount,
        ...(params.productIds?.length ? { content_ids: params.productIds, content_type: "product" } : {}),
      },
      eventId
    );
  },

  /**
   * Note: For Riser's COD workflow, genuine Purchase events are fired server-side via CAPI
   * strictly when an order is both DELIVERED and PAID (tracked & deduplicated in Neon).
   * Never call Purchase at initial COD checkout.
   */
  purchase(params: {
    orderId: string;
    orderNumber: string;
    totalValue: number;
    items?: Array<{ id: string; name: string; price: number; quantity: number }>;
  }): void {
    const eventId = `pur-${params.orderNumber}`;
    gtagEvent("purchase", {
      transaction_id: params.orderNumber,
      value: params.totalValue,
      currency: "BDT",
    });
    fbEvent(
      "Purchase",
      {
        order_id: params.orderNumber,
        value: params.totalValue,
        currency: "BDT",
        content_type: "product",
        ...(params.items?.length ? { content_ids: params.items.map((i) => i.id) } : {}),
      },
      eventId
    );
  },

  search(searchTerm: string): void {
    gtagEvent("search", { search_term: searchTerm });
    fbEvent("Search", { search_string: searchTerm });
  },
};
