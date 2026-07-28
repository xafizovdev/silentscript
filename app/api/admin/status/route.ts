import { NextResponse } from "next/server";
import { blobAuthMode, blobStorageConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const blobEnvironmentKeys = Object.keys(process.env)
    .filter((key) => key.toUpperCase().includes("BLOB"))
    .sort();
  const configured = blobStorageConfigured();

  return NextResponse.json(
    {
      configured,
      mode: "vercel-blob",
      authMode: blobAuthMode(),
      directPublish: configured,
      environment: process.env.VERCEL_TARGET_ENV ?? process.env.VERCEL_ENV ?? "unknown",
      productionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? null,
      deploymentUrl: process.env.VERCEL_URL ?? null,
      blobEnvironmentKeys,
      hasStandardToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim()),
      hasStoreId: Boolean(process.env.BLOB_STORE_ID?.trim()),
      hasWebhookPublicKey: Boolean(process.env.BLOB_WEBHOOK_PUBLIC_KEY?.trim()),
    },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
  );
}
