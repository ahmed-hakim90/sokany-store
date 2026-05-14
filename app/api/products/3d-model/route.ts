import { Readable } from "node:stream";
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getAdminStorageBucket } from "@/lib/firebase-admin";
import { API_NO_INDEX_HEADERS } from "@/lib/api-no-index";
import { WOO_CACHE_TAG_PRODUCTS } from "@/lib/woocommerce-cache-tags";

export const runtime = "nodejs";

const MODEL_CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400";

type CachedProduct3DModelMetadata = {
  exists: boolean;
  contentType: string;
  size: number;
};

function isSafeProduct3DPath(path: string): boolean {
  return (
    path.startsWith("models/products/") &&
    !path.includes("..") &&
    /\.(glb|gltf)$/i.test(path)
  );
}

function getCachedProduct3DModelMetadata(
  storagePath: string,
): Promise<CachedProduct3DModelMetadata> {
  return unstable_cache(
    async () => {
      const file = getAdminStorageBucket().file(storagePath);
      const [exists] = await file.exists();
      if (!exists) {
        return { exists: false, contentType: "model/gltf-binary", size: 0 };
      }

      const [metadata] = await file.getMetadata();
      return {
        exists: true,
        contentType: metadata.contentType || "model/gltf-binary",
        size: Number(metadata.size ?? 0),
      };
    },
    ["firebase-product-3d-model-meta-v1", storagePath],
    { revalidate: 3600, tags: [WOO_CACHE_TAG_PRODUCTS] },
  )();
}

export async function GET(request: NextRequest) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json(
      { error: "Service unavailable" },
      { status: 503, headers: API_NO_INDEX_HEADERS },
    );
  }

  const storagePath = request.nextUrl.searchParams.get("path")?.trim() ?? "";
  if (!isSafeProduct3DPath(storagePath)) {
    return NextResponse.json(
      { error: "Bad path" },
      { status: 400, headers: API_NO_INDEX_HEADERS },
    );
  }

  try {
    const metadata = await getCachedProduct3DModelMetadata(storagePath);
    if (!metadata.exists) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404, headers: API_NO_INDEX_HEADERS },
      );
    }

    const file = getAdminStorageBucket().file(storagePath);

    return new NextResponse(Readable.toWeb(file.createReadStream()) as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": metadata.contentType,
        ...(Number.isFinite(metadata.size) && metadata.size > 0
          ? { "Content-Length": String(metadata.size) }
          : {}),
        "Accept-Ranges": "none",
        "Cache-Control": MODEL_CACHE_CONTROL,
        "X-Content-Type-Options": "nosniff",
        ...API_NO_INDEX_HEADERS,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load model" },
      { status: 500, headers: API_NO_INDEX_HEADERS },
    );
  }
}
