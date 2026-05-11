import { Readable } from "node:stream";
import { NextRequest, NextResponse } from "next/server";
import { getAdminStorageBucket } from "@/lib/firebase-admin";

export const runtime = "nodejs";

function isSafeProduct3DPath(path: string): boolean {
  return (
    path.startsWith("models/products/") &&
    !path.includes("..") &&
    /\.(glb|gltf)$/i.test(path)
  );
}

export async function GET(request: NextRequest) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const storagePath = request.nextUrl.searchParams.get("path")?.trim() ?? "";
  if (!isSafeProduct3DPath(storagePath)) {
    return NextResponse.json({ error: "Bad path" }, { status: 400 });
  }

  try {
    const file = getAdminStorageBucket().file(storagePath);
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || "model/gltf-binary";
    const size = Number(metadata.size ?? 0);

    return new NextResponse(Readable.toWeb(file.createReadStream()) as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        ...(Number.isFinite(size) && size > 0 ? { "Content-Length": String(size) } : {}),
        "Accept-Ranges": "none",
        "Cache-Control": "public, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load model" }, { status: 500 });
  }
}
