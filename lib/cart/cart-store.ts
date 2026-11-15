"use client";

import { useMemo, useSyncExternalStore } from "react";
import { MAX_QTY_PER_LINE } from "@/lib/shipping";

export type CartLine = {
  /** productId + size + color — one line per variant */
  key: string;
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  /** Price shown to the customer. The server always re-checks it at checkout. */
  price: number;
  size: string;
  color: string;
  qty: number;
};

const STORAGE_KEY = "riser:cart:v1";
const EMPTY: CartLine[] = [];

let state: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

export function makeLineKey(productId: string, size: string, color: string) {
  return `${productId}__${size}__${color}`;
}

function isLine(v: unknown): v is CartLine {
  if (!v || typeof v !== "object") return false;
  const l = v as CartLine;
  return (
    typeof l.key === "string" &&
    typeof l.productId === "string" &&
    typeof l.name === "string" &&
    typeof l.price === "number" &&
    typeof l.qty === "number" &&
    l.qty > 0
  );
}

function readStorage(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY;
    const lines = parsed.filter(isLine).map((l) => ({
      ...l,
      qty: Math.min(MAX_QTY_PER_LINE, Math.max(1, Math.floor(l.qty))),
    }));
    return lines.length ? lines : EMPTY;
  } catch {
    return EMPTY;
  }
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = readStorage();
  // keep multiple tabs in sync
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      state = readStorage();
      emit();
    }
  });
}

function emit() {
  listeners.forEach((l) => l());
}

function commit(next: CartLine[]) {
  state = next.length ? next : EMPTY;
  try {
    if (state.length) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage full / private mode — cart still works for this session */
  }
  emit();
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  load();
  return state;
}

function getServerSnapshot() {
  return EMPTY;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export function addToCart(line: Omit<CartLine, "key">) {
  load();
  const key = makeLineKey(line.productId, line.size, line.color);
  const existing = state.find((l) => l.key === key);
  if (existing) {
    commit(
      state.map((l) =>
        l.key === key
          ? { ...l, price: line.price, qty: Math.min(MAX_QTY_PER_LINE, l.qty + line.qty) }
          : l
      )
    );
  } else {
    commit([...state, { ...line, key, qty: Math.min(MAX_QTY_PER_LINE, line.qty) }]);
  }
}

export function setLineQty(key: string, qty: number) {
  load();
  if (qty < 1) return removeLine(key);
  commit(state.map((l) => (l.key === key ? { ...l, qty: Math.min(MAX_QTY_PER_LINE, qty) } : l)));
}

export function removeLine(key: string) {
  load();
  commit(state.filter((l) => l.key !== key));
}

export function clearCart() {
  load();
  commit([]);
}

/** Apply fresh prices / availability returned by the server after a failed checkout. */
export function syncCartFromServer(
  updates: { key: string; unitPrice: number; maxQty: number | null; available: boolean }[]
) {
  load();
  const byKey = new Map(updates.map((u) => [u.key, u]));
  commit(
    state
      .map((l) => {
        const u = byKey.get(l.key);
        if (!u) return l;
        if (!u.available) return null;
        const cap = u.maxQty === null ? MAX_QTY_PER_LINE : Math.min(MAX_QTY_PER_LINE, u.maxQty);
        return { ...l, price: u.unitPrice, qty: Math.min(l.qty, Math.max(1, cap)) };
      })
      .filter((l): l is CartLine => l !== null)
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCart() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    return { lines, count, subtotal };
  }, [lines]);
}
