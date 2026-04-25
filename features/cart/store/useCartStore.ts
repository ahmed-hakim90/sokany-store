"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CART_STORAGE_KEY } from "@/lib/constants";
import type { CartItem, CartState } from "@/features/cart/types";
import type { Product } from "@/features/products/types";

function totals(items: CartItem[]): { totalItems: number; totalPrice: number } {
  return {
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      addToCart: (product: Product, quantity = 1) => {
        const items = [...get().items];
        const existing = items.find((i) => i.productId === product.id);
        if (existing) {
          existing.quantity += quantity;
        } else {
          items.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            thumbnail: product.thumbnail,
            sku: product.sku,
          });
        }
        const t = totals(items);
        set({ items, ...t });
      },
      removeFromCart: (productId: number) => {
        const items = get().items.filter((i) => i.productId !== productId);
        const t = totals(items);
        set({ items, ...t });
      },
      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        const items = get().items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i,
        );
        const t = totals(items);
        set({ items, ...t });
      },
      replaceAllItems: (items: CartItem[]) => {
        const t = totals(items);
        set({ items, ...t });
      },
      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
    }),
    {
      name: CART_STORAGE_KEY,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const t = totals(state.items);
        state.totalItems = t.totalItems;
        state.totalPrice = t.totalPrice;
      },
    },
  ),
);
