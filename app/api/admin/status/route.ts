import { NextResponse } from "next/server";
import { blobStorageConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const candidateTokenKeys = Object.keys(process.env)
    .filter((key) => key.toUpperCase().includes("BLOB") || key.toUpperCase().includes("READ_WRITE_TOKEN"))
    .sort();

  const configured = blobStorageConfigured();

  return NextResponse.json(
    {
      configured,
      mode: "vercel-blob",
      directPublish: configured,
      environment: process.env.VERCEL_TARGET_ENV ?? process.env.VERCEL_ENV ?? "unknown",
      productionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? null,
      deploymentUrl: process.env.VERCEL_URL ?? null,
      candidateTokenKeys,
      hasStandardToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim()),
    },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
  );
}
