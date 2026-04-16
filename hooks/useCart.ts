"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useCartStore } from "@/features/cart/store/useCartStore";
import type { Product } from "@/features/products/types";

export function useCart() {
  const hasHydrated = useHasHydrated(useCartStore);
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const safeItems = hasHydrated ? items : [];
  const safeTotalItems = hasHydrated ? totalItems : 0;
  const safeTotalPrice = hasHydrated ? totalPrice : 0;

  const setProductLineQuantity = useCallback((product: Product, next: number) => {
    const q = Math.max(0, Math.floor(next));
    const { items: liveItems, addToCart: add, removeFromCart: remove, updateQuantity: update } =
      useCartStore.getState();
    const current = liveItems.find((i) => i.productId === product.id)?.quantity ?? 0;

    if (q === 0) {
      if (current > 0) {
        remove(product.id);
        toast.info("تمت إزالة المنتج من السلة");
      }
      return;
    }

    if (current === 0) {
      add(product, q);
      toast.success(`تمت إضافة ${product.name} إلى السلة`);
      return;
    }

    if (q !== current) {
      update(product.id, q);
    }
  }, []);

  return {
    hasHydrated,
    items: safeItems,
    totalItems: safeTotalItems,
    totalPrice: safeTotalPrice,
    isEmpty: safeItems.length === 0,
    setProductLineQuantity,
    addProduct(product: Product, quantity = 1) {
      addToCart(product, quantity);
      toast.success(`تمت إضافة ${product.name} إلى السلة`);
    },
    removeProduct(productId: number) {
      removeFromCart(productId);
      toast.info("تمت إزالة المنتج من السلة");
    },
    updateProductQuantity(productId: number, quantity: number) {
      updateQuantity(productId, quantity);
    },
    clearCart,
  };
}
