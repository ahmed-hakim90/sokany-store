import type { Product, ProductVariation } from "@/features/products/types";

export function isVariableProduct(product: Product): boolean {
  if (product.productType === "variable") return true;
  const variations = product.wooExcess?.variations;
  return Array.isArray(variations) && variations.length > 0;
}

export function variationAttributeNames(product: Product): string[] {
  return product.attributes
    .filter((a) => a.variation && a.options.length > 0)
    .sort((a, b) => a.position - b.position)
    .map((a) => a.name);
}

export function formatVariationLabel(
  attributes: Record<string, string>,
): string {
  return Object.values(attributes).filter(Boolean).join(" / ");
}

export function findVariationByAttributes(
  variations: ProductVariation[],
  selected: Record<string, string>,
): ProductVariation | null {
  const entries = Object.entries(selected).filter(([, v]) => v.trim());
  if (entries.length === 0) return null;
  return (
    variations.find((variation) =>
      entries.every(([name, option]) =>
        variation.attributes.some(
          (a) => a.name === name && a.option === option,
        ),
      ),
    ) ?? null
  );
}

export function variationPriceRange(
  variations: ProductVariation[],
): { low: number; high: number } | null {
  if (variations.length === 0) return null;
  const prices = variations.map((v) => v.price);
  return { low: Math.min(...prices), high: Math.max(...prices) };
}

export function readUpsellIds(product: Product): number[] {
  const raw = product.wooExcess?.upsell_ids;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((id) => (typeof id === "number" ? id : Number(id)))
    .filter((id) => Number.isFinite(id) && id > 0);
}
