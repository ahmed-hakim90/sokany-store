import "server-only";

import * as admin from "firebase-admin";
import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  getStaticProduct3DModelBySku,
  normalizeProductSku,
  type Product3DModel,
} from "@/lib/product-3d-map";

export const PRODUCT_3D_ASSETS_COLLECTION = "product_3d_assets";

export type Product3DAsset = {
  sku: string;
  productId?: string | number;
  productName?: string;
  modelUrl: string;
  storagePath: string;
  posterUrl?: string;
  enabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type Product3DAssetWrite = {
  sku: string;
  productId?: string | number;
  productName?: string;
  modelUrl: string;
  storagePath: string;
  posterUrl?: string;
  enabled: boolean;
};

export function product3DAssetDocIdFromSku(sku: string): string {
  return encodeURIComponent(normalizeProductSku(sku));
}

export function storageObjectNameForProduct3DSku(
  sku: string,
  extension: "glb" | "gltf" = "glb",
): string {
  const normalizedSku = normalizeProductSku(sku);
  const safeSku = normalizedSku.replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `models/products/${safeSku || "product"}.${extension}`;
}

export function firebaseStoragePublicUrl(bucketName: string, storagePath: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(storagePath)}?alt=media`;
}

export function product3DModelPublicUrlFromStoragePath(storagePath: string): string {
  return `/api/products/3d-model?path=${encodeURIComponent(storagePath)}`;
}

function timestampToIso(value: unknown): string | null {
  if (value instanceof admin.firestore.Timestamp) {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function productIdOrUndefined(value: unknown): string | number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

function assetFromFirestoreData(data: FirebaseFirestore.DocumentData): Product3DAsset | null {
  const sku = stringOrUndefined(data.sku);
  const storagePath = stringOrUndefined(data.storagePath);
  const modelUrl = storagePath
    ? product3DModelPublicUrlFromStoragePath(storagePath)
    : stringOrUndefined(data.modelUrl);
  if (!sku || !modelUrl || !storagePath) return null;

  return {
    sku,
    productId: productIdOrUndefined(data.productId),
    productName: stringOrUndefined(data.productName),
    modelUrl,
    storagePath,
    posterUrl: stringOrUndefined(data.posterUrl),
    enabled: data.enabled === true,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

export async function getProduct3DAssetBySku(
  sku: string | null | undefined,
): Promise<Product3DAsset | null> {
  const normalizedSku = normalizeProductSku(sku);
  if (!normalizedSku) return null;

  const snap = await getAdminFirestore()
    .collection(PRODUCT_3D_ASSETS_COLLECTION)
    .doc(product3DAssetDocIdFromSku(normalizedSku))
    .get();
  if (!snap.exists) return null;

  const data = snap.data();
  return data ? assetFromFirestoreData(data) : null;
}

export async function getProduct3DModelBySku(
  sku: string | null | undefined,
): Promise<Product3DModel | null> {
  const normalizedSku = normalizeProductSku(sku);
  if (!normalizedSku) return null;

  try {
    const asset = await getProduct3DAssetBySku(normalizedSku);
    if (asset?.enabled && asset.modelUrl) {
      return {
        src: asset.modelUrl,
        storagePath: asset.storagePath,
      };
    }
  } catch (error) {
    console.error("Failed to resolve Firestore 3D asset", error);
  }

  return getStaticProduct3DModelBySku(normalizedSku);
}

export async function listProduct3DAssets(): Promise<Product3DAsset[]> {
  const snap = await getAdminFirestore()
    .collection(PRODUCT_3D_ASSETS_COLLECTION)
    .orderBy("updatedAt", "desc")
    .limit(200)
    .get();

  return snap.docs
    .map((doc) => assetFromFirestoreData(doc.data()))
    .filter((asset): asset is Product3DAsset => asset != null);
}

export async function upsertProduct3DAsset(
  input: Product3DAssetWrite,
): Promise<Product3DAsset> {
  const normalizedSku = normalizeProductSku(input.sku);
  if (!normalizedSku) {
    throw new Error("SKU is required");
  }

  const ref = getAdminFirestore()
    .collection(PRODUCT_3D_ASSETS_COLLECTION)
    .doc(product3DAssetDocIdFromSku(normalizedSku));
  const existing = await ref.get();
  const now = admin.firestore.FieldValue.serverTimestamp();
  await ref.set(
    {
      sku: normalizedSku,
      ...(input.productId != null ? { productId: input.productId } : {}),
      ...(input.productName?.trim() ? { productName: input.productName.trim() } : {}),
      modelUrl: input.modelUrl,
      storagePath: input.storagePath,
      ...(input.posterUrl?.trim() ? { posterUrl: input.posterUrl.trim() } : {}),
      enabled: input.enabled,
      ...(existing.exists ? {} : { createdAt: now }),
      updatedAt: now,
    },
    { merge: true },
  );

  const saved = await ref.get();
  const asset = saved.data() ? assetFromFirestoreData(saved.data()!) : null;
  if (!asset) {
    throw new Error("Failed to save 3D asset metadata");
  }
  return asset;
}

export async function updateProduct3DAssetEnabled(
  sku: string,
  enabled: boolean,
): Promise<Product3DAsset> {
  const normalizedSku = normalizeProductSku(sku);
  if (!normalizedSku) {
    throw new Error("SKU is required");
  }
  const ref = getAdminFirestore()
    .collection(PRODUCT_3D_ASSETS_COLLECTION)
    .doc(product3DAssetDocIdFromSku(normalizedSku));
  const existing = await ref.get();
  const now = admin.firestore.FieldValue.serverTimestamp();
  await ref.set(
    {
      sku: normalizedSku,
      enabled,
      ...(existing.exists ? {} : { createdAt: now }),
      updatedAt: now,
    },
    { merge: true },
  );
  const saved = await ref.get();
  const asset = saved.data() ? assetFromFirestoreData(saved.data()!) : null;
  if (!asset) {
    throw new Error("3D asset metadata is incomplete");
  }
  return asset;
}

export async function deleteProduct3DAssetMetadata(sku: string): Promise<Product3DAsset | null> {
  const normalizedSku = normalizeProductSku(sku);
  if (!normalizedSku) return null;

  const ref = getAdminFirestore()
    .collection(PRODUCT_3D_ASSETS_COLLECTION)
    .doc(product3DAssetDocIdFromSku(normalizedSku));
  const snap = await ref.get();
  const asset = snap.data() ? assetFromFirestoreData(snap.data()!) : null;
  await ref.delete();
  return asset;
}
