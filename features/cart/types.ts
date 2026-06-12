import type { Product } from "@/features/products/types";

export type CartItem = {
  productId: number;
  /** WooCommerce variation id when the line is a variable product. */
  variationId?: number;
  /** Selected attribute values for display (e.g. اللون → أحمر). */
  variationAttributes?: Record<string, string>;
  /** Short label for cart/checkout lines. */
  variationLabel?: string;
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
  updatingLineKey: string | null;
  addToCart: (
    product: Product,
    quantity?: number,
    options?: {
      variationId?: number;
      variationAttributes?: Record<string, string>;
      variationLabel?: string;
      price?: number;
      regularPrice?: number;
      sku?: string;
      thumbnail?: string;
    },
  ) => void;
  removeFromCart: (productId: number, variationId?: number) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    variationId?: number,
  ) => void;
  setUpdatingLineKey: (lineKey: string | null) => void;
  replaceAllItems: (items: CartItem[]) => void;
  clearCart: () => void;
};
