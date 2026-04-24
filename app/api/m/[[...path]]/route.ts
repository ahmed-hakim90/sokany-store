import { NextResponse } from "next/server";
import { getAdminStorageBucket } from "@/lib/firebase-admin";
import { isSafeCmsObjectPath } from "@/lib/cms-file-path";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ path?: string[] }> };

/**
 * بث الملفات المرفوعة عبر تخزين الـ CMS بروابط الموقع:
 * `GET /api/m/<بعد-cms/>`  ← يوافق المسار `cms/<...>` في التخزين
 */
export async function GET(_request: Request, context: RouteContext) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const { path: rawSegments } = await context.params;
  const segments = Array.isArray(rawSegments) ? rawSegments : [];
  if (segments.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rel = segments
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    })
    .join("/");
  if (!rel || rel.includes("..")) {
    return NextResponse.json({ error: "Bad path" }, { status: 400 });
  }

  const objectPath = `cms/${rel}`;
  if (!isSafeCmsObjectPath(objectPath)) {
    return NextResponse.json({ error: "Bad path" }, { status: 400 });
  }

  try {
    const bucket = getAdminStorageBucket();
    const file = bucket.file(objectPath);
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const [metadata] = await file.getMetadata();
    const [buf] = await file.download();
    const contentType = metadata.contentType || "application/octet-stream";
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // نفس المسار قد يُستبدل بمحتوى جديد
        "Cache-Control": "public, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load file" }, { status: 500 });
  }
}
