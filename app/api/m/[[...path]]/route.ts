import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { getAdminStorageBucket } from "@/lib/firebase-admin";
import { isSafeCmsObjectPath } from "@/lib/cms-file-path";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ path?: string[] }> };

/**
 * بث الملفات المرفوعة عبر تخزين الـ CMS بروابط الموقع:
 * `GET /api/m/<بعد-cms/>`  ← يوافق المسار `cms/<...>` في التخزين
 */
export async function GET(request: Request, context: RouteContext) {
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
    const contentType = metadata.contentType || "application/octet-stream";
    const size = Number(metadata.size ?? 0);
    const range = request.headers.get("range");

    if (range && Number.isFinite(size) && size > 0) {
      const match = range.match(/bytes=(\d*)-(\d*)/);
      if (match) {
        const start = match[1] ? Number(match[1]) : 0;
        const end = match[2] ? Number(match[2]) : size - 1;
        const safeStart = Math.max(0, Math.min(start, size - 1));
        const safeEnd = Math.max(safeStart, Math.min(end, size - 1));
        const stream = Readable.toWeb(
          file.createReadStream({ start: safeStart, end: safeEnd }),
        );
        return new NextResponse(stream as BodyInit, {
          status: 206,
          headers: {
            "Content-Type": contentType,
            "Content-Length": String(safeEnd - safeStart + 1),
            "Content-Range": `bytes ${safeStart}-${safeEnd}/${size}`,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=0, must-revalidate",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
    }

    const [buf] = await file.download();
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        ...(Number.isFinite(size) && size > 0 ? { "Content-Length": String(size) } : {}),
        "Accept-Ranges": "bytes",
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
