import "server-only";
import { USE_MOCK } from "@/lib/constants";
import { createWooClient } from "@/lib/create-woo-client";
import { mapProduct } from "@/features/products/adapters";
import { mockProducts } from "@/features/products/mock";
import { getSnapshotProducts } from "@/features/data-snapshot/server";
import { wpProductSchema } from "@/schemas/wordpress";
import type { Product } from "@/features/products/types";

export async function getProductByIdMeta(
  id: number,
): Promise<Product | null> {
  const fallbackProducts = getSnapshotProducts() ?? mockProducts;
  if (USE_MOCK) {
    const raw = fallbackProducts.find((p) => p.id === id);
    return raw ? mapProduct(wpProductSchema.parse(raw)) : null;
  }
  try {
    const woo = createWooClient();
    const res = await woo.get(`/products/${id}`);
    return mapProduct(wpProductSchema.parse(res.data));
  } catch {
    const raw = fallbackProducts.find((p) => p.id === id);
    return raw ? mapProduct(wpProductSchema.parse(raw)) : null;
  }
}
