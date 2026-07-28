import { NextResponse } from "next/server";
import { isAdminPassword, blobStorageConfigured } from "@/lib/admin-auth";
import { publishCatalog, readPublishedCatalog } from "@/lib/blob-catalog";
import { isCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function unauthorized() {
  return NextResponse.json({ error: "Admin sessiyasi tasdiqlanmadi." }, { status: 401 });
}

export async function GET(request: Request) {
  if (!isAdminPassword(request.headers.get("x-admin-password"))) return unauthorized();
  const catalog = await readPublishedCatalog();
  return NextResponse.json(catalog, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
  if (!isAdminPassword(request.headers.get("x-admin-password"))) return unauthorized();
  if (!blobStorageConfigured()) {
    return NextResponse.json(
      { error: "Vercel Blob hali ulanmagan. Project → Storage → Create Database → Blob orqali bir marta ulang." },
      { status: 503 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isCatalog(body)) return NextResponse.json({ error: "Katalog formati noto‘g‘ri." }, { status: 400 });

  try {
    const result = await publishCatalog(body);
    return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Katalog saqlanmadi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
