import { NextRequest, NextResponse } from "next/server";
import { requireScopeFull } from "@/lib/api-control-auth";
import { hasControlPanelTab } from "@/lib/control-panel-tab";
import { getAdminStorageBucket } from "@/lib/firebase-admin";
import { normalizeProductSku } from "@/lib/product-3d-map";
import {
  product3DModelPublicUrlFromStoragePath,
  storageObjectNameForProduct3DSku,
} from "@/features/products/services/product-3d-assets";

export const runtime = "nodejs";

const ALLOWED_CONTENT_TYPES = new Set([
  "model/gltf-binary",
  "model/gltf+json",
  "application/octet-stream",
  "application/json",
]);

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

function normalizeModelContentType(type: string, extension: "glb" | "gltf"): string {
  if (type && type !== "application/octet-stream") return type;
  return extension === "glb" ? "model/gltf-binary" : "model/gltf+json";
}

export async function POST(request: NextRequest) {
  const auth = await require3DAssetsAccess(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  let payload: { sku?: unknown; filename?: unknown; contentType?: unknown };
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

  const contentType = normalizeModelContentType(
    typeof payload.contentType === "string" ? payload.contentType : "",
    extension,
  );
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json({ error: "نوع ملف 3D غير مدعوم" }, { status: 400 });
  }

  const storagePath = storageObjectNameForProduct3DSku(sku, extension);
  const file = getAdminStorageBucket().file(storagePath);
  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType,
  });

  return NextResponse.json({
    uploadUrl,
    storagePath,
    modelUrl: product3DModelPublicUrlFromStoragePath(storagePath),
    contentType,
  });
}
