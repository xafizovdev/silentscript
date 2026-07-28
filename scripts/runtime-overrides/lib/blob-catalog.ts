import "server-only";
import { list, put, type ListBlobResultBlob } from "@vercel/blob";
import defaultCatalog from "@/data/catalog.json";
import { isCatalog, type Catalog } from "@/lib/catalog";
import { blobStorageConfigured } from "@/lib/admin-auth";

const CATALOG_PREFIX = "silent-script/catalog/";

function newest(blobs: ListBlobResultBlob[]): ListBlobResultBlob | undefined {
  return [...blobs]
    .filter((blob) => blob.pathname.endsWith(".json"))
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];
}

export async function readPublishedCatalog(): Promise<Catalog> {
  if (!blobStorageConfigured()) return defaultCatalog as Catalog;

  try {
    const result = await list({ prefix: CATALOG_PREFIX, limit: 100 });
    const blob = newest(result.blobs);
    if (!blob) return defaultCatalog as Catalog;

    const response = await fetch(`${blob.url}?v=${encodeURIComponent(blob.etag)}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return defaultCatalog as Catalog;

    const parsed: unknown = await response.json();
    return isCatalog(parsed) ? parsed : (defaultCatalog as Catalog);
  } catch {
    return defaultCatalog as Catalog;
  }
}

export async function publishCatalog(value: Catalog): Promise<{ catalog: Catalog; url: string }> {
  if (!blobStorageConfigured()) throw new Error("BLOB_STORAGE_NOT_CONFIGURED");
  if (!isCatalog(value)) throw new Error("INVALID_CATALOG");

  const catalog: Catalog = {
    ...value,
    version: Math.max(1, Math.floor(value.version) + 1),
    updatedAt: new Date().toISOString(),
  };
  const pathname = `${CATALOG_PREFIX}catalog-v${catalog.version}-${Date.now()}.json`;
  const blob = await put(pathname, `${JSON.stringify(catalog, null, 2)}\n`, {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json; charset=utf-8",
    cacheControlMaxAge: 60,
  });
  return { catalog, url: blob.url };
}
