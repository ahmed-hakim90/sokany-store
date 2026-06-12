/**
 * مزامنة أسعار ومخزون السلة مع Woo عبر BFF — بدون كاش محلي.
 */
import { mapProduct } from "@/features/products/adapters";
import { getProductVariations } from "@/features/products/services/getProductVariations";
import type { Product } from "@/features/products/types";
import { apiClient } from "@/lib/api";
import { withCommerceTrust } from "@/lib/storefront-commerce-fetch";
import { wpProductSchema } from "@/schemas/wordpress";
import type { CartItem } from "@/features/cart/types";
import { cartItemLineKey } from "@/features/cart/lib/cart-line-key";

export type CartSyncIssue = {
  lineKey: string;
  productId: number;
  name: string;
  kind: "out_of_stock" | "not_found" | "price_changed";
  message: string;
  previousPrice?: number;
  nextPrice?: number;
};

export type CartSyncResult = {
  items: CartItem[];
  issues: CartSyncIssue[];
  hasBlockingIssues: boolean;
};

async function fetchProductsByIds(ids: number[]): Promise<Map<number, Product>> {
  if (ids.length === 0) return new Map();
  const unique = [...new Set(ids)];
  const response = await apiClient.get(
    "/products",
    withCommerceTrust({
      params: {
        include: unique.join(","),
        per_page: unique.length,
      },
    }),
  );
  const rows = Array.isArray(response.data) ? response.data : [];
  const map = new Map<number, Product>();
  for (const raw of rows) {
    const product = mapProduct(wpProductSchema.parse(raw));
    map.set(product.id, product);
  }
  return map;
}

export async function syncCartWithServer(items: CartItem[]): Promise<CartSyncResult> {
  if (items.length === 0) {
    return { items: [], issues: [], hasBlockingIssues: false };
  }

  const productIds = [...new Set(items.map((i) => i.productId))];
  const productsById = await fetchProductsByIds(productIds);

  const variationParents = new Set(
    items
      .filter((i) => i.variationId != null && i.variationId > 0)
      .map((i) => i.productId),
  );
  const variationsByParent = new Map<
    number,
    Awaited<ReturnType<typeof getProductVariations>>
  >();
  await Promise.all(
    [...variationParents].map(async (parentId) => {
      const variations = await getProductVariations(parentId, { commerceTrust: true });
      variationsByParent.set(parentId, variations);
    }),
  );

  const issues: CartSyncIssue[] = [];
  const nextItems: CartItem[] = [];

  for (const item of items) {
    const lineKey = cartItemLineKey(item);
    const product = productsById.get(item.productId);

    if (!product) {
      issues.push({
        lineKey,
        productId: item.productId,
        name: item.name,
        kind: "not_found",
        message: "المنتج لم يعد متوفراً في المتجر.",
      });
      continue;
    }

    let price = product.price;
    let regularPrice =
      product.regularPrice > product.price ? product.regularPrice : undefined;
    let inStock = product.inStock;
    let sku = product.sku || item.sku;
    let thumbnail = product.thumbnail || item.thumbnail;
    let name = product.name;

    if (item.variationId != null && item.variationId > 0) {
      const variations = variationsByParent.get(item.productId) ?? [];
      const variation = variations.find((v) => v.id === item.variationId);
      if (!variation) {
        issues.push({
          lineKey,
          productId: item.productId,
          name: item.name,
          kind: "not_found",
          message: "التنويع المختار لم يعد متوفراً.",
        });
        continue;
      }
      price = variation.price;
      regularPrice =
        variation.regularPrice > variation.price
          ? variation.regularPrice
          : undefined;
      inStock = variation.inStock;
      sku = variation.sku || sku;
      thumbnail = variation.image?.src || thumbnail;
      if (item.variationLabel) {
        name = `${product.name} — ${item.variationLabel}`;
      }
    }

    if (!inStock) {
      issues.push({
        lineKey,
        productId: item.productId,
        name,
        kind: "out_of_stock",
        message: "المنتج غير متوفر حالياً.",
      });
      continue;
    }

    if (Math.abs(price - item.price) > 0.009) {
      issues.push({
        lineKey,
        productId: item.productId,
        name,
        kind: "price_changed",
        message: "تم تحديث السعر وفق أحدث بيانات المتجر.",
        previousPrice: item.price,
        nextPrice: price,
      });
    }

    nextItems.push({
      ...item,
      name,
      price,
      regularPrice,
      sku,
      thumbnail,
    });
  }

  const hasBlockingIssues = issues.some(
    (i) => i.kind === "out_of_stock" || i.kind === "not_found",
  );

  return { items: nextItems, issues, hasBlockingIssues };
}
