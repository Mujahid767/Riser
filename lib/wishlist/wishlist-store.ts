"use client";

/**
 * lib/wishlist/wishlist-store.ts
 * Phase 6: localStorage wishlist — no login required.
 */

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "riser:wishlist";

function readStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(ids: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // quota exceeded — silent
  }
}

/** Dispatch a custom event so all tabs/components stay in sync. */
function broadcast() {
  window.dispatchEvent(new Event("riser:wishlist-change"));
}

export function addToWishlist(productId: string): void {
  const ids = readStorage();
  if (!ids.includes(productId)) {
    writeStorage([...ids, productId]);
    broadcast();
  }
}

export function removeFromWishlist(productId: string): void {
  writeStorage(readStorage().filter((id) => id !== productId));
  broadcast();
}

export function toggleWishlist(productId: string): void {
  const ids = readStorage();
  if (ids.includes(productId)) {
    writeStorage(ids.filter((id) => id !== productId));
  } else {
    writeStorage([...ids, productId]);
  }
  broadcast();
}

export function isWishlisted(productId: string): boolean {
  return readStorage().includes(productId);
}

/** React hook — returns live wishlist state and helpers. */
export function useWishlist() {
  const [ids, setIds] = useState<string[]>([]);

  const sync = useCallback(() => setIds(readStorage()), []);

  useEffect(() => {
    sync();
    window.addEventListener("riser:wishlist-change", sync);
    window.addEventListener("storage", sync); // cross-tab
    return () => {
      window.removeEventListener("riser:wishlist-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const toggle = useCallback((productId: string) => {
    toggleWishlist(productId);
  }, []);

  const check = useCallback((productId: string) => ids.includes(productId), [ids]);

  return { ids, count: ids.length, toggle, check };
}
