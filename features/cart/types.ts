import type { Product } from "@/features/products/types";

export type CartItem = {
  productId: number;
  /** WooCommerce variation id when the line is a variable product. */
  variationId?: number;
  /** WooCommerce order line_item id — set when amending an existing order. */
  wooLineItemId?: number;
  name: string;
  price: number;
  /** Original list price when different from the active cart price. */
  regularPrice?: number;
  quantity: number;
  thumbnail: string;
  sku: string;
};

export type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  /** Line currently changing quantity (drawer / cart page spinner). */
  updatingLineId: number | null;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  setUpdatingLineId: (productId: number | null) => void;
  replaceAllItems: (items: CartItem[]) => void;
  clearCart: () => void;
};
