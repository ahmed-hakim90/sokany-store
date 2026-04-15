"use client";

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

  return {
    hasHydrated,
    items: safeItems,
    totalItems: safeTotalItems,
    totalPrice: safeTotalPrice,
    isEmpty: safeItems.length === 0,
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
