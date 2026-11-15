/**
 * lib/auth/session.ts
 * Phase 3: bcrypt password verification, login rate limiting, HMAC-signed session cookie.
 */
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "riser_admin";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type AdminSession = {
  email: string;
  exp: number;
};

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("Set AUTH_SECRET before running the admin panel in production.");
  }
  return "riser-dev-auth-secret-change-me";
}

export function adminCredentials(): { email: string; passwordHash?: string; password?: string } | null {
  const email = (process.env.ADMIN_EMAIL || "admin@riser.com.bd").trim().toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH; // bcrypt hash (preferred)
  const plain = process.env.ADMIN_PASSWORD;      // plain fallback

  if (!hash && !plain) {
    if (process.env.NODE_ENV === "production") return null;
    return { email, password: "RiserAdmin2026" }; // dev-only fallback
  }
  return { email, passwordHash: hash || undefined, password: plain || undefined };
}

// ─── HMAC session token ──────────────────────────────────────────────────────

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(authSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function createSessionToken(email: string): Promise<string> {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify({ email, exp: Date.now() + MAX_AGE_MS }))
  );
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<AdminSession | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = await sign(payload);
  if (!safeEqual(signature, expected)) return null;
  try {
    const data = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payload))
    ) as AdminSession;
    if (!data.email || typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
}

/**
 * Verify a password against the stored credential.
 * Supports bcrypt hashes (ADMIN_PASSWORD_HASH) and plain text (ADMIN_PASSWORD).
 * bcrypt runs only on Node.js runtime — never call from edge.
 */
export async function verifyAdminPassword(input: string): Promise<boolean> {
  const creds = adminCredentials();
  if (!creds) return false;

  if (creds.passwordHash) {
    // bcrypt comparison — dynamically imported so edge builds don't break
    const { compare } = await import("bcryptjs");
    return compare(input, creds.passwordHash);
  }

  // Plain text fallback (dev or simple production use)
  return safeEqual(input, creds.password ?? "");
}
