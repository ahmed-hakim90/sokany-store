import { apiClient } from "@/lib/api";
import { withCommerceTrust } from "@/lib/storefront-commerce-fetch";
import { wpProductVariationsListSchema } from "@/schemas/wordpress";
import { mapProductVariations } from "@/features/products/adapters/variation";
import type { ProductVariation } from "@/features/products/types";

export async function getProductVariations(
  productId: number,
  options?: { commerceTrust?: boolean },
): Promise<ProductVariation[]> {
  const config = options?.commerceTrust ? withCommerceTrust() : undefined;
  const response = await apiClient.get(
    `/products/${productId}/variations`,
    config,
  );
  const parsed = wpProductVariationsListSchema.parse(response.data);
  return mapProductVariations(parsed);
}
