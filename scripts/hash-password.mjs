#!/usr/bin/env node
/**
 * scripts/hash-password.mjs
 * Generate a bcrypt hash for ADMIN_PASSWORD_HASH in .env.local
 *
 * Usage:
 *   node scripts/hash-password.mjs "YourNewPassword123"
 *
 * Then paste the output into .env.local:
 *   ADMIN_PASSWORD_HASH="$2b$12$..."
 * And remove (or leave blank) ADMIN_PASSWORD.
 */
import { hash } from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs \"YourPassword\"");
  process.exit(1);
}

const hashed = await hash(password, 12);
console.log("\n✅  Bcrypt hash (cost=12):");
console.log(hashed);
console.log("\nAdd to .env.local:");
console.log(`ADMIN_PASSWORD_HASH="${hashed}"`);
console.log("Then remove or blank out ADMIN_PASSWORD.\n");
