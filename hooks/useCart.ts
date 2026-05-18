"use client";

/**
 * واجهة السلة للمكوّنات
 * بالعامية: غلاف فوق `useCartStore` مع انتظار الـ hydration علشان SSR ما يختلفش عن أول رسمة في العميل؛ فيه toasts بسيطة للإضافة/الحذف.
 *
 * شوف كمان: `@/features/cart/store/useCartStore.ts`، `@/hooks/useHasHydrated.ts`
 */
import { useCallback } from "react";
import { toast } from "sonner";
import { validateCartLineQuantity } from "@/features/cart/lib/validate-cart-line-quantity";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import type { Product } from "@/features/products/types";

const LINE_UPDATE_MIN_MS = 120;

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
  error(message: string) {
    toast.error(message, { id: "cart-line-error" });
  },
};

function withLineUpdate(productId: number, action: () => void) {
  const { setUpdatingLineId } = useCartStore.getState();
  setUpdatingLineId(productId);
  const started = Date.now();
  try {
    action();
  } finally {
    const wait = Math.max(0, LINE_UPDATE_MIN_MS - (Date.now() - started));
    window.setTimeout(() => {
      if (useCartStore.getState().updatingLineId === productId) {
        setUpdatingLineId(null);
      }
    }, wait);
  }
}

export function useCart() {
  const hasHydrated = useHasHydrated(useCartStore);
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const updatingLineId = useCartStore((state) => state.updatingLineId);
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
        withLineUpdate(product.id, () => {
          const removedName = liveItems.find((i) => i.productId === product.id)?.name;
          remove(product.id);
          cartToast.removed(product.id, removedName);
        });
      }
      return;
    }

    const validationError = validateCartLineQuantity(product, q);
    if (validationError) {
      cartToast.error(validationError);
      return;
    }

    if (current === 0) {
      withLineUpdate(product.id, () => {
        add(product, q);
        cartToast.added(product);
      });
      return;
    }

    if (q !== current) {
      withLineUpdate(product.id, () => update(product.id, q));
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
    updatingLineId: hasHydrated ? updatingLineId : null,
    isEmpty: safeItems.length === 0,
    getCartLineQuantity,
    setProductLineQuantity,
    addProduct(product: Product, quantity = 1) {
      const q = Math.max(1, Math.floor(quantity));
      const validationError = validateCartLineQuantity(product, q);
      if (validationError) {
        cartToast.error(validationError);
        return false;
      }
      withLineUpdate(product.id, () => {
        addToCart(product, q);
        cartToast.added(product);
      });
      return true;
    },
    removeProduct(productId: number) {
      const removedName = useCartStore
        .getState()
        .items.find((item) => item.productId === productId)?.name;
      withLineUpdate(productId, () => {
        removeFromCart(productId);
        cartToast.removed(productId, removedName);
      });
    },
    updateProductQuantity(productId: number, quantity: number) {
      const q = Math.max(0, Math.floor(quantity));
      if (q <= 0) {
        const removedName = useCartStore
          .getState()
          .items.find((item) => item.productId === productId)?.name;
        withLineUpdate(productId, () => {
          removeFromCart(productId);
          cartToast.removed(productId, removedName);
        });
        return;
      }
      withLineUpdate(productId, () => updateQuantity(productId, q));
    },
    clearCart,
    replaceAllItems,
  };
}
