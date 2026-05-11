import { NextRequest, NextResponse } from "next/server";
import { requireScopeFull } from "@/lib/api-control-auth";
import { hasControlPanelTab } from "@/lib/control-panel-tab";
import { getAdminStorageBucket } from "@/lib/firebase-admin";
import { normalizeProductSku } from "@/lib/product-3d-map";
import {
  deleteProduct3DAssetMetadata,
  updateProduct3DAssetEnabled,
} from "@/features/products/services/product-3d-assets";

export const runtime = "nodejs";

type RouteProps = { params: Promise<{ sku: string }> };

async function require3DAssetsAccess(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;
  if (hasControlPanelTab(auth, "product3d")) return auth;
  return NextResponse.json(
    { error: "ليس لديك صلاحية إدارة نماذج 3D من هذا الحساب" },
    { status: 403 },
  );
}

export async function PATCH(request: NextRequest, { params }: RouteProps) {
  const auth = await require3DAssetsAccess(request);
  if (auth instanceof NextResponse) return auth;

  const { sku: rawSku } = await params;
  const sku = normalizeProductSku(decodeURIComponent(rawSku));
  if (!sku) {
    return NextResponse.json({ error: "SKU غير صالح" }, { status: 400 });
  }

  let payload: { enabled?: unknown };
  try {
    payload = (await request.json()) as { enabled?: unknown };
  } catch {
    return NextResponse.json({ error: "JSON غير صالح" }, { status: 400 });
  }

  if (typeof payload.enabled !== "boolean") {
    return NextResponse.json({ error: "enabled يجب أن يكون true أو false" }, { status: 400 });
  }

  try {
    const asset = await updateProduct3DAssetEnabled(sku, payload.enabled);
    return NextResponse.json({ asset });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "تعذر تحديث حالة نموذج 3D" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const auth = await require3DAssetsAccess(request);
  if (auth instanceof NextResponse) return auth;

  const { sku: rawSku } = await params;
  const sku = normalizeProductSku(decodeURIComponent(rawSku));
  if (!sku) {
    return NextResponse.json({ error: "SKU غير صالح" }, { status: 400 });
  }

  try {
    const asset = await deleteProduct3DAssetMetadata(sku);
    if (asset?.storagePath) {
      await getAdminStorageBucket().file(asset.storagePath).delete({ ignoreNotFound: true });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "تعذر حذف نموذج 3D" }, { status: 500 });
  }
}
