import type { Product } from "@/features/products/types";

export type CartItem = {
  productId: number;
  /** WooCommerce variation id when the line is a variable product. */
  variationId?: number;
  /** WooCommerce order line_item id — set when amending an existing order. */
  wooLineItemId?: number;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
  sku: string;
};

export type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  replaceAllItems: (items: CartItem[]) => void;
  clearCart: () => void;
};
