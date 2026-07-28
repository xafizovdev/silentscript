import { NextResponse } from "next/server";
import { blobStorageConfigured, isAdminPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAdminPassword(request.headers.get("x-admin-password"))) {
    return NextResponse.json({ error: "Parol noto‘g‘ri." }, { status: 401 });
  }
  return NextResponse.json(
    { ok: true, storageConfigured: blobStorageConfigured() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
