import type { CartItem } from "@/features/cart/types";
import type { Order } from "@/features/orders/types";

export function orderItemsToCartItems(order: Order): CartItem[] {
  return order.items.map((li) => ({
    productId: li.productId,
    variationId: li.variationId,
    wooLineItemId: li.id,
    name: li.name,
    price: li.price,
    quantity: li.quantity,
    thumbnail: li.image,
    sku: "",
  }));
}
