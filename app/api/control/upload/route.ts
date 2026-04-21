import { NextRequest, NextResponse } from "next/server";
import { requireControlSession } from "@/lib/api-control-auth";
import { getAdminStorageBucket } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export async function POST(request: NextRequest) {
  const auth = await requireControlSession(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof Blob) || file.size < 1) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 6MB)" }, { status: 400 });
  }
  const type = file.type || "application/octet-stream";
  if (!ALLOWED.has(type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const rawName = typeof form.get("filename") === "string" ? String(form.get("filename")) : "upload";
  const safeBase = rawName.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "upload";
  const buf = Buffer.from(await file.arrayBuffer());
  const path = `cms/${Date.now()}-${safeBase}`;

  try {
    const bucket = getAdminStorageBucket();
    const ref = bucket.file(path);
    await ref.save(buf, {
      metadata: { contentType: type, cacheControl: "public,max-age=31536000" },
    });
    const [url] = await ref.getSignedUrl({
      action: "read",
      expires: new Date("2100-01-01"),
    });
    return NextResponse.json({ url, path });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
