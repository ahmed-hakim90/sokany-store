import type { Product } from "@/features/products/types";

export type WishlistItem = {
  productId: number;
  name: string;
  thumbnail: string;
  price: number;
};

export type WishlistState = {
  items: WishlistItem[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: number) => void;
  toggleProduct: (product: Product) => void;
};
