import type { CartItem } from "@/features/cart/types";

/** مفتاح فريد لسطر السلة (منتج بسيط أو متغير). */
export function cartItemLineKey(
  item: Pick<CartItem, "productId" | "variationId">,
): string {
  return `${item.productId}:${item.variationId ?? 0}`;
}

export function parseCartLineKey(key: string): {
  productId: number;
  variationId?: number;
} {
  const [productPart, variationPart] = key.split(":");
  const productId = Number(productPart);
  const variationId = Number(variationPart);
  return {
    productId,
    variationId: variationId > 0 ? variationId : undefined,
  };
}
