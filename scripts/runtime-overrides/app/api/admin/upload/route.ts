import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { blobStorageConfigured, isAdminPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 4 * 1024 * 1024;

function safeFilename(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot).toLowerCase() : ".jpg";
  const base = (dot >= 0 ? name.slice(0, dot) : name)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60) || "product";
  return `${base}${ext}`;
}

export async function POST(request: Request) {
  if (!isAdminPassword(request.headers.get("x-admin-password"))) {
    return NextResponse.json({ error: "Admin sessiyasi tasdiqlanmadi." }, { status: 401 });
  }
  if (!blobStorageConfigured()) {
    return NextResponse.json(
      { error: "Vercel Blob hali ulanmagan. Project → Storage → Create Database → Blob orqali bir marta ulang." },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Rasm tanlanmagan." }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Faqat JPG, PNG yoki WEBP rasm yuklang." }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "Rasm 4 MB dan oshmasligi kerak." }, { status: 400 });

  try {
    const blob = await put(`silent-script/products/${Date.now()}-${safeFilename(file.name)}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
      cacheControlMaxAge: 31536000,
    });
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rasm yuklanmadi.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
