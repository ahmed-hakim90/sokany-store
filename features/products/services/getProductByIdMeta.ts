import "server-only";
import { USE_MOCK } from "@/lib/constants";
import { createWooClient } from "@/lib/create-woo-client";
import { mapProduct } from "@/features/products/adapters";
import { mockProducts } from "@/features/products/mock";
import { wpProductSchema } from "@/schemas/wordpress";
import type { Product } from "@/features/products/types";

export async function getProductByIdMeta(
  id: number,
): Promise<Product | null> {
  if (USE_MOCK) {
    const raw = mockProducts.find((p) => p.id === id);
    return raw ? mapProduct(wpProductSchema.parse(raw)) : null;
  }
  try {
    const woo = createWooClient();
    const res = await woo.get(`/products/${id}`);
    return mapProduct(wpProductSchema.parse(res.data));
  } catch {
    const raw = mockProducts.find((p) => p.id === id);
    return raw ? mapProduct(wpProductSchema.parse(raw)) : null;
  }
}
