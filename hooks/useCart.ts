"use client";

/**
 * واجهة السلة للمكوّنات
 * بالعامية: غلاف فوق `useCartStore` مع انتظار الـ hydration علشان SSR ما يختلفش عن أول رسمة في العميل؛ فيه toasts بسيطة للإضافة/الحذف.
 *
 * شوف كمان: `@/features/cart/store/useCartStore.ts`، `@/hooks/useHasHydrated.ts`
 */
import { useCallback } from "react";
import { toast } from "sonner";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useCartStore } from "@/features/cart/store/useCartStore";
import type { Product } from "@/features/products/types";

const cartToast = {
  added(product: Product) {
    toast.dismiss(`cart-removed-${product.id}`);
    toast.success("تمت الإضافة للسلة", {
      id: `cart-added-${product.id}`,
      description: product.name,
    });
  },
  removed(productId: number, name?: string) {
    toast.dismiss(`cart-added-${productId}`);
    toast.info("تمت الإزالة من السلة", {
      id: `cart-removed-${productId}`,
      description: name,
    });
  },
};

export function useCart() {
  const hasHydrated = useHasHydrated(useCartStore);
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const replaceAllItems = useCartStore((state) => state.replaceAllItems);

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
        const removedName = liveItems.find((i) => i.productId === product.id)?.name;
        remove(product.id);
        cartToast.removed(product.id, removedName);
      }
      return;
    }

    if (current === 0) {
      add(product, q);
      cartToast.added(product);
      return;
    }

    if (q !== current) {
      update(product.id, q);
    }
  }, []);

  const getCartLineQuantity = useCallback(
    (productId: number) =>
      useCartStore.getState().items.find((item) => item.productId === productId)?.quantity ?? 0,
    [],
  );

  return {
    hasHydrated,
    items: safeItems,
    totalItems: safeTotalItems,
    totalPrice: safeTotalPrice,
    isEmpty: safeItems.length === 0,
    getCartLineQuantity,
    setProductLineQuantity,
    addProduct(product: Product, quantity = 1) {
      addToCart(product, quantity);
      cartToast.added(product);
    },
    removeProduct(productId: number) {
      const removedName = useCartStore
        .getState()
        .items.find((item) => item.productId === productId)?.name;
      removeFromCart(productId);
      cartToast.removed(productId, removedName);
    },
    updateProductQuantity(productId: number, quantity: number) {
      updateQuantity(productId, quantity);
    },
    clearCart,
    replaceAllItems,
  };
}
