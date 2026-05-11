import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { NextRequest, NextResponse } from "next/server";
import { requireScopeFull } from "@/lib/api-control-auth";
import { hasControlPanelTab } from "@/lib/control-panel-tab";
import { getAdminStorageBucket } from "@/lib/firebase-admin";
import { normalizeProductSku } from "@/lib/product-3d-map";
import {
  listProduct3DAssets,
  product3DModelPublicUrlFromStoragePath,
  storageObjectNameForProduct3DSku,
  upsertProduct3DAsset,
} from "@/features/products/services/product-3d-assets";

export const runtime = "nodejs";

const WARN_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["glb", "gltf"]);
const ALLOWED_CONTENT_TYPES = new Set([
  "model/gltf-binary",
  "model/gltf+json",
  "application/octet-stream",
  "application/json",
]);

function require3DAssetsAccess(auth: Awaited<ReturnType<typeof requireScopeFull>>) {
  if (auth instanceof NextResponse) return auth;
  if (hasControlPanelTab(auth, "product3d")) return null;
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

function decodeParam(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value).trim() || undefined;
  } catch {
    return value.trim() || undefined;
  }
}

function productIdFromRaw(raw: string | null): string | number | undefined {
  const value = decodeParam(raw);
  if (!value) return undefined;
  return Number.isFinite(Number(value)) ? Number(value) : value;
}

function enabledFromRaw(raw: string | null): boolean {
  return raw !== "false";
}

function warningForSize(size: number | null): "over-5mb" | "ok" | "unknown" {
  if (size == null) return "unknown";
  return size > WARN_BYTES ? "over-5mb" : "ok";
}

export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;
  const denied = require3DAssetsAccess(auth);
  if (denied) return denied;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  const assets = await listProduct3DAssets();
  return NextResponse.json({ assets });
}

export async function POST(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;
  const denied = require3DAssetsAccess(auth);
  if (denied) return denied;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  const requestContentType = request.headers.get("content-type") ?? "";
  if (!requestContentType.toLowerCase().startsWith("multipart/form-data")) {
    const { searchParams } = request.nextUrl;
    const sku = normalizeProductSku(searchParams.get("sku"));
    if (!sku) {
      return NextResponse.json({ error: "SKU مطلوب" }, { status: 400 });
    }

    const filename = decodeParam(searchParams.get("filename")) ?? "model.glb";
    const extension = getModelExtension(filename);
    if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json({ error: "يسمح فقط بملفات .glb أو .gltf" }, { status: 400 });
    }

    const contentType = normalizeModelContentType(requestContentType, extension);
    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return NextResponse.json({ error: "نوع ملف 3D غير مدعوم" }, { status: 400 });
    }

    if (!request.body) {
      return NextResponse.json({ error: "اختر ملف GLB أو GLTF" }, { status: 400 });
    }

    const productId = productIdFromRaw(searchParams.get("productId"));
    const productName = decodeParam(searchParams.get("productName"));
    const posterUrl = decodeParam(searchParams.get("posterUrl"));
    const enabled = enabledFromRaw(searchParams.get("enabled"));
    const storagePath = storageObjectNameForProduct3DSku(sku, extension);
    const contentLength = Number.parseInt(request.headers.get("content-length") ?? "", 10);
    const size = Number.isFinite(contentLength) && contentLength > 0 ? contentLength : null;

    try {
      const bucket = getAdminStorageBucket();
      const ref = bucket.file(storagePath);
      await pipeline(
        Readable.fromWeb(request.body as unknown as Parameters<typeof Readable.fromWeb>[0]),
        ref.createWriteStream({
          metadata: {
            contentType,
            cacheControl: "public,max-age=31536000,immutable",
            metadata: {
              source: "sokany-control-product-3d",
              warning: warningForSize(size),
            },
          },
        }),
      );

      const asset = await upsertProduct3DAsset({
        sku,
        productId,
        productName,
        modelUrl: product3DModelPublicUrlFromStoragePath(storagePath),
        storagePath,
        posterUrl,
        enabled,
      });

      return NextResponse.json({ asset });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "فشل رفع نموذج 3D" }, { status: 500 });
    }
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form" }, { status: 400 });
  }

  const sku = normalizeProductSku(String(form.get("sku") ?? ""));
  if (!sku) {
    return NextResponse.json({ error: "SKU مطلوب" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof Blob) || file.size < 1) {
    return NextResponse.json({ error: "اختر ملف GLB أو GLTF" }, { status: 400 });
  }
  const filename = String(form.get("filename") ?? "model.glb");
  const extension = getModelExtension(filename);
  if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
    return NextResponse.json({ error: "يسمح فقط بملفات .glb أو .gltf" }, { status: 400 });
  }

  const contentType = normalizeModelContentType(file.type, extension);
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json({ error: "نوع ملف 3D غير مدعوم" }, { status: 400 });
  }

  const productIdRaw = form.get("productId");
  const productId =
    typeof productIdRaw === "string" && productIdRaw.trim()
      ? Number.isFinite(Number(productIdRaw))
        ? Number(productIdRaw)
        : productIdRaw.trim()
      : undefined;
  const productName = String(form.get("productName") ?? "").trim() || undefined;
  const posterUrl = String(form.get("posterUrl") ?? "").trim() || undefined;
  const enabled = String(form.get("enabled") ?? "true") !== "false";
  const storagePath = storageObjectNameForProduct3DSku(sku, extension);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const bucket = getAdminStorageBucket();
    const ref = bucket.file(storagePath);
    await ref.save(buffer, {
      metadata: {
        contentType,
        cacheControl: "public,max-age=31536000,immutable",
        metadata: {
          source: "sokany-control-product-3d",
          warning: file.size > WARN_BYTES ? "over-5mb" : "ok",
        },
      },
    });

    const asset = await upsertProduct3DAsset({
      sku,
      productId,
      productName,
      modelUrl: product3DModelPublicUrlFromStoragePath(storagePath),
      storagePath,
      posterUrl,
      enabled,
    });

    return NextResponse.json({ asset });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل رفع نموذج 3D" }, { status: 500 });
  }
}
