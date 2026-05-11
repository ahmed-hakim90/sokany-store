import "server-only";

import type { Product } from "@/features/products/types";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import type { AssistantProductCard } from "@/features/assistant/types";

export function productToAssistantCard(
  product: Product,
  options?: { badge?: string; reason?: string },
): AssistantProductCard {
  return {
    id: product.id,
    name: product.name,
    url: ROUTES.PRODUCT(product.id),
    thumbnail: product.thumbnail,
    price: formatCurrency(product.price),
    regularPrice:
      product.regularPrice > product.price
        ? formatCurrency(product.regularPrice)
        : undefined,
    salePrice: product.salePrice ? formatCurrency(product.salePrice) : undefined,
    onSale: product.onSale,
    inStock: product.inStock,
    badge: options?.badge,
    reason: options?.reason,
  };
}

export function productsToAssistantCards(
  products: Product[],
  reasonFor?: (product: Product, index: number) => string | undefined,
): AssistantProductCard[] {
  return products.map((product, index) =>
    productToAssistantCard(product, { reason: reasonFor?.(product, index) }),
  );
}
