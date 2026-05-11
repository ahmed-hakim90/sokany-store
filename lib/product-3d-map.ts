export type Product3DModel = {
  src: string;
  storagePath?: string;
};

/**
 * Firebase Storage public GLB URLs keyed by normalized SKU.
 *
 * Add entries with lowercase SKUs, for example:
 * "sk-1008": { src: "https://firebasestorage.googleapis.com/..." }
 */
export const product3DMap: Record<string, Product3DModel> = {};

export function normalizeProductSku(sku: string | null | undefined): string {
  return sku?.trim().toLowerCase() ?? "";
}

export function getStaticProduct3DModelBySku(
  sku: string | null | undefined,
): Product3DModel | null {
  const normalizedSku = normalizeProductSku(sku);
  if (!normalizedSku) return null;

  return product3DMap[normalizedSku] ?? null;
}
