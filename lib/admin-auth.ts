import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

const DEFAULT_PASSWORD_HASH = "427e42c936a7099664bd9b73a1c4001c4e28a1e83f4f6dbd9bbfb28536156279";

function sha256(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function isAdminPassword(value: string | null): boolean {
  if (!value) return false;
  const configured = process.env.ADMIN_PASSWORD?.trim();
  const expected = configured ? sha256(configured) : Buffer.from(DEFAULT_PASSWORD_HASH, "hex");
  const received = sha256(value);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Legacy long-lived token support for older Blob connections. */
export function getBlobReadWriteToken(): string | undefined {
  const standard = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (standard) return standard;

  for (const [key, rawValue] of Object.entries(process.env)) {
    const value = rawValue?.trim();
    if (!value) continue;
    const likelyBlobKey = key.includes("BLOB") && key.endsWith("READ_WRITE_TOKEN");
    const likelyBlobValue = value.startsWith("vercel_blob_rw_");
    if (likelyBlobKey || likelyBlobValue) return value;
  }

  return undefined;
}

/**
 * New Vercel Blob project connections use short-lived OIDC credentials.
 * In that mode there is no BLOB_READ_WRITE_TOKEN; Vercel exposes the store
 * metadata and the latest @vercel/blob SDK authenticates automatically.
 */
export function blobStorageConfigured(): boolean {
  const legacyToken = Boolean(getBlobReadWriteToken());
  const oidcConnection = Boolean(
    process.env.BLOB_STORE_ID?.trim() && process.env.BLOB_WEBHOOK_PUBLIC_KEY?.trim(),
  );
  return legacyToken || oidcConnection;
}

export function blobAuthMode(): "legacy-token" | "oidc" | "missing" {
  if (getBlobReadWriteToken()) return "legacy-token";
  if (process.env.BLOB_STORE_ID?.trim() && process.env.BLOB_WEBHOOK_PUBLIC_KEY?.trim()) return "oidc";
  return "missing";
}
