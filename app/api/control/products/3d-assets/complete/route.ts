import { NextRequest, NextResponse } from "next/server";
import { requireScopeFull } from "@/lib/api-control-auth";
import { hasControlPanelTab } from "@/lib/control-panel-tab";
import { getAdminStorageBucket } from "@/lib/firebase-admin";
import { normalizeProductSku } from "@/lib/product-3d-map";
import {
  product3DModelPublicUrlFromStoragePath,
  storageObjectNameForProduct3DSku,
  upsertProduct3DAsset,
} from "@/features/products/services/product-3d-assets";

export const runtime = "nodejs";

const WARN_BYTES = 5 * 1024 * 1024;

async function require3DAssetsAccess(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;
  if (hasControlPanelTab(auth, "product3d")) return auth;
  return NextResponse.json(
    { error: "ليس لديك صلاحية إدارة نماذج 3D من هذا الحساب" },
    { status: 403 },
  );
}

function getModelExtension(filename: string): "glb" | "gltf" | null {
  const ext = filename.toLowerCase().split(".").pop();
  return ext === "glb" || ext === "gltf" ? ext : null;
}

function productIdOrUndefined(value: unknown): string | number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    return Number.isFinite(Number(value)) ? Number(value) : value.trim();
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  const auth = await require3DAssetsAccess(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  let payload: {
    sku?: unknown;
    filename?: unknown;
    storagePath?: unknown;
    productId?: unknown;
    productName?: unknown;
    posterUrl?: unknown;
    enabled?: unknown;
  };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "JSON غير صالح" }, { status: 400 });
  }

  const sku = normalizeProductSku(typeof payload.sku === "string" ? payload.sku : "");
  if (!sku) {
    return NextResponse.json({ error: "SKU مطلوب" }, { status: 400 });
  }

  const filename = typeof payload.filename === "string" ? payload.filename : "model.glb";
  const extension = getModelExtension(filename);
  if (!extension) {
    return NextResponse.json({ error: "يسمح فقط بملفات .glb أو .gltf" }, { status: 400 });
  }

  const expectedStoragePath = storageObjectNameForProduct3DSku(sku, extension);
  const storagePath = typeof payload.storagePath === "string" ? payload.storagePath : "";
  if (storagePath !== expectedStoragePath) {
    return NextResponse.json({ error: "مسار التخزين غير مطابق للـ SKU" }, { status: 400 });
  }

  const bucketFile = getAdminStorageBucket().file(storagePath);
  const [exists] = await bucketFile.exists();
  if (!exists) {
    return NextResponse.json({ error: "لم يتم العثور على الملف بعد الرفع" }, { status: 404 });
  }

  const [metadata] = await bucketFile.getMetadata();
  const size = Number(metadata.size ?? 0);
  await bucketFile.setMetadata({
    cacheControl: "public,max-age=31536000,immutable",
    metadata: {
      ...(metadata.metadata ?? {}),
      source: "sokany-control-product-3d",
      warning: Number.isFinite(size) && size > WARN_BYTES ? "over-5mb" : "ok",
    },
  });

  const asset = await upsertProduct3DAsset({
    sku,
    productId: productIdOrUndefined(payload.productId),
    productName:
      typeof payload.productName === "string" && payload.productName.trim()
        ? payload.productName.trim()
        : undefined,
    modelUrl: product3DModelPublicUrlFromStoragePath(storagePath),
    storagePath,
    posterUrl:
      typeof payload.posterUrl === "string" && payload.posterUrl.trim()
        ? payload.posterUrl.trim()
        : undefined,
    enabled: payload.enabled !== false,
  });

  return NextResponse.json({ asset });
}
