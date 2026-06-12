"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { cartItemLineKey } from "@/features/cart/lib/cart-line-key";
import { CART_STORAGE_KEY } from "@/lib/constants";
import type { CartItem, CartState } from "@/features/cart/types";
import type { Product } from "@/features/products/types";

function totals(items: CartItem[]): { totalItems: number; totalPrice: number } {
  return {
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };
}

function findLineIndex(
  items: CartItem[],
  productId: number,
  variationId?: number,
): number {
  return items.findIndex(
    (i) =>
      i.productId === productId &&
      (i.variationId ?? 0) === (variationId ?? 0),
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      updatingLineKey: null,
      setUpdatingLineKey: (lineKey) => set({ updatingLineKey: lineKey }),
      addToCart: (product: Product, quantity = 1, options) => {
        const items = [...get().items];
        const variationId = options?.variationId;
        const idx = findLineIndex(items, product.id, variationId);
        const linePrice = options?.price ?? product.price;
        const regularPrice =
          options?.regularPrice ??
          (product.regularPrice > linePrice ? product.regularPrice : undefined);
        const lineName =
          options?.variationLabel && options.variationLabel.length > 0
            ? `${product.name} — ${options.variationLabel}`
            : product.name;

        if (idx >= 0) {
          items[idx] = {
            ...items[idx],
            quantity: items[idx].quantity + quantity,
            price: linePrice,
            regularPrice,
            name: lineName,
            sku: options?.sku ?? items[idx].sku,
            thumbnail: options?.thumbnail ?? items[idx].thumbnail,
            variationAttributes:
              options?.variationAttributes ?? items[idx].variationAttributes,
            variationLabel: options?.variationLabel ?? items[idx].variationLabel,
          };
        } else {
          items.push({
            productId: product.id,
            variationId,
            variationAttributes: options?.variationAttributes,
            variationLabel: options?.variationLabel,
            name: lineName,
            price: linePrice,
            regularPrice,
            quantity,
            thumbnail: options?.thumbnail ?? product.thumbnail,
            sku: options?.sku ?? product.sku,
          });
        }
        const t = totals(items);
        set({ items, ...t });
      },
      removeFromCart: (productId: number, variationId?: number) => {
        const items = get().items.filter(
          (i) =>
            !(
              i.productId === productId &&
              (i.variationId ?? 0) === (variationId ?? 0)
            ),
        );
        const t = totals(items);
        set({ items, ...t });
      },
      updateQuantity: (
        productId: number,
        quantity: number,
        variationId?: number,
      ) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, variationId);
          return;
        }
        const items = get().items.map((i) =>
          i.productId === productId &&
          (i.variationId ?? 0) === (variationId ?? 0)
            ? { ...i, quantity }
            : i,
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
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          throw new Error("localStorage is only available in the browser.");
        }
        return window.localStorage;
      }),
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

export { cartItemLineKey };
