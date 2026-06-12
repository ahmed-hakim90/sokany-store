/**
 * منتج واحد من الـ BFF (عميل)
 * بالعامية: للاستخدام من المتصفح عبر `apiClient` — مش كاش سيرفر هنا.
 *
 * شوف كمان: `@/features/products/services/getProductByIdMeta.ts` للـ RSC
 */
import { apiClient } from "@/lib/api";
import { withCommerceTrust } from "@/lib/storefront-commerce-fetch";
import { wpProductSchema } from "@/schemas/wordpress";
import { mapProduct } from "../adapters";
import type { Product } from "../types";

export async function getProductById(
  id: number,
  options?: { commerceTrust?: boolean },
): Promise<Product> {
  const config = options?.commerceTrust ? withCommerceTrust() : undefined;
  const response = await apiClient.get(`/products/${id}`, config);
  return mapProduct(wpProductSchema.parse(response.data));
}
