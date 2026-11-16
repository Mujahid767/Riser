/**
 * lib/courier/crypto.ts
 * AES-256-GCM encryption for courier credentials stored in the database.
 * The key is derived from COURIER_ENCRYPTION_KEY (preferred) or AUTH_SECRET.
 * Node.js runtime only.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function key(): Buffer {
  const secret = process.env.COURIER_ENCRYPTION_KEY || process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Set AUTH_SECRET (or COURIER_ENCRYPTION_KEY) before saving courier credentials.");
    }
    return createHash("sha256").update("riser-dev-auth-secret-change-me").digest();
  }
  return createHash("sha256").update(secret).digest();
}

/** Returns "iv.tag.ciphertext" (base64url). */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString("base64url")).join(".");
}

export function decryptSecret(payload: string | null | undefined): string | null {
  if (!payload) return null;
  try {
    const [iv, tag, enc] = payload.split(".").map((p) => Buffer.from(p, "base64url"));
    const decipher = createDecipheriv("aes-256-gcm", key(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
  } catch {
    return null; // key changed or data corrupt — treat as "not set"
  }
}

/** "abcd…wxyz" style preview that never reveals the full secret. */
export function maskSecret(plain: string | null): string {
  if (!plain) return "";
  if (plain.length <= 8) return "••••••••";
  return `${plain.slice(0, 3)}••••••••${plain.slice(-3)}`;
}
