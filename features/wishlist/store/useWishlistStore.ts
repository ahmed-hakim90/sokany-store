"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WISHLIST_STORAGE_KEY } from "@/lib/constants";
import type { Product } from "@/features/products/types";
import type { WishlistItem, WishlistState } from "@/features/wishlist/types";

function toItem(product: Product): WishlistItem {
  return {
    productId: product.id,
    name: product.name,
    thumbnail: product.thumbnail,
    price: product.price,
  };
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addProduct: (product: Product) => {
        const items = get().items;
        if (items.some((i) => i.productId === product.id)) return;
        set({ items: [...items, toItem(product)] });
      },
      removeProduct: (productId: number) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      toggleProduct: (product: Product) => {
        const { items, addProduct, removeProduct } = get();
        if (items.some((i) => i.productId === product.id)) {
          removeProduct(product.id);
        } else {
          addProduct(product);
        }
      },
    }),
    {
      name: WISHLIST_STORAGE_KEY,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
