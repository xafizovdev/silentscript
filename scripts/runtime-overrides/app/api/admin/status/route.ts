import { NextResponse } from "next/server";
import { blobStorageConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      configured: blobStorageConfigured(),
      mode: "vercel-blob",
      directPublish: blobStorageConfigured(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
