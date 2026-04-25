import "server-only";
import { USE_MOCK } from "@/lib/constants";
import { createWooClient } from "@/lib/create-woo-client";
import { mapProduct } from "@/features/products/adapters";
import { mockProducts } from "@/features/products/mock";
import { getSnapshotProducts } from "@/features/data-snapshot/server";
import { wpProductSchema } from "@/schemas/wordpress";
import { isWcProductOutOfStockOnly } from "@/lib/woo-storefront-availability";
import type { Product } from "@/features/products/types";

export async function getProductByIdMeta(
  id: number,
): Promise<Product | null> {
  const fallbackProducts = getSnapshotProducts() ?? mockProducts;
  if (USE_MOCK) {
    const raw = fallbackProducts.find((p) => p.id === id);
    if (!raw) return null;
    if (isWcProductOutOfStockOnly(raw)) return null;
    return mapProduct(wpProductSchema.parse(raw));
  }
  try {
    const woo = await createWooClient();
    const res = await woo.get(`/products/${id}`);
    const raw = wpProductSchema.parse(res.data);
    if (isWcProductOutOfStockOnly(raw)) {
      return null;
    }
    return mapProduct(raw);
  } catch {
    if (!USE_MOCK) {
      return null;
    }
    const raw = fallbackProducts.find((p) => p.id === id);
    if (!raw) return null;
    if (isWcProductOutOfStockOnly(raw)) return null;
    return mapProduct(wpProductSchema.parse(raw));
  }
}
