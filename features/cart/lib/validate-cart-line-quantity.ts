import type { Product } from "@/features/products/types";

/** Returns Arabic error message when quantity cannot be added, or null if OK. */
export function validateCartLineQuantity(product: Product, quantity: number): string | null {
  if (quantity <= 0) return null;
  if (!product.inStock) return "المنتج غير متوفر حالياً";
  if (
    product.stockQuantity != null &&
    product.stockQuantity > 0 &&
    quantity > product.stockQuantity
  ) {
    return `الكمية المتاحة ${product.stockQuantity} فقط`;
  }
  return null;
}
