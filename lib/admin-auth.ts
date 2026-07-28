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

export function blobStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}
