import { NextResponse } from "next/server";
import { readPublishedCatalog } from "@/lib/blob-catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const catalog = await readPublishedCatalog();
  return NextResponse.json(catalog, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "CDN-Cache-Control": "no-store",
    },
  });
}
