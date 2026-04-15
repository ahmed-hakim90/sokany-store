import type { Product } from "@/features/products/types";

export type CartItem = {
  productId: number;
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
  clearCart: () => void;
};
