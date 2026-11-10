// Analytics abstraction layer — keeps tracking code out of components
// Supports GA4 + Meta Pixel with a clean unified API

type EventProperties = Record<string, string | number | boolean | undefined>;

// ─── Google Analytics ─────────────────────────────────────────────────────────

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
    dataLayer: unknown[];
  }
}

function gtagEvent(eventName: string, params?: EventProperties): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}

// ─── Meta Pixel ───────────────────────────────────────────────────────────────

function fbEvent(eventName: string, params?: EventProperties): void {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", eventName, params);
}

// ─── Unified Analytics Events ─────────────────────────────────────────────────

export const analytics = {
  /**
   * Page view — called automatically by layout or route change
   */
  pageView(url: string): void {
    gtagEvent("page_view", { page_path: url });
    fbEvent("PageView");
  },

  /**
   * Product viewed
   */
  viewContent(params: {
    productId: string;
    productName: string;
    category?: string;
    price?: number;
    currency?: string;
  }): void {
    gtagEvent("view_item", {
      item_id: params.productId,
      item_name: params.productName,
      item_category: params.category,
      price: params.price,
      currency: params.currency ?? "BDT",
    });
    fbEvent("ViewContent", {
      content_ids: params.productId,
      content_name: params.productName,
      content_category: params.category,
      value: params.price,
      currency: params.currency ?? "BDT",
    });
  },

  /**
   * Product added to cart
   */
  addToCart(params: {
    productId: string;
    productName: string;
    variant?: string;
    price: number;
    quantity: number;
  }): void {
    gtagEvent("add_to_cart", {
      item_id: params.productId,
      item_name: params.productName,
      item_variant: params.variant,
      price: params.price,
      quantity: params.quantity,
      currency: "BDT",
    });
    fbEvent("AddToCart", {
      content_ids: params.productId,
      content_name: params.productName,
      value: params.price * params.quantity,
      currency: "BDT",
    });
  },

  /**
   * Checkout initiated
   */
  initiateCheckout(params: {
    totalValue: number;
    itemCount: number;
    currency?: string;
  }): void {
    gtagEvent("begin_checkout", {
      value: params.totalValue,
      currency: params.currency ?? "BDT",
    });
    fbEvent("InitiateCheckout", {
      value: params.totalValue,
      currency: params.currency ?? "BDT",
      num_items: params.itemCount,
    });
  },

  /**
   * Purchase completed
   */
  purchase(params: {
    orderId: string;
    totalValue: number;
    currency?: string;
    items?: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>;
  }): void {
    gtagEvent("purchase", {
      transaction_id: params.orderId,
      value: params.totalValue,
      currency: params.currency ?? "BDT",
    });
    fbEvent("Purchase", {
      order_id: params.orderId,
      value: params.totalValue,
      currency: params.currency ?? "BDT",
    });
  },

  /**
   * Search performed
   */
  search(searchTerm: string): void {
    gtagEvent("search", { search_term: searchTerm });
    fbEvent("Search", { search_string: searchTerm });
  },
};
