"use client";

/**
 * واجهة السلة للمكوّنات
 * بالعامية: غلاف فوق `useCartStore` مع انتظار الـ hydration علشان SSR ما يختلفش عن أول رسمة في العميل؛ فيه toasts بسيطة للإضافة/الحذف.
 *
 * شوف كمان: `@/features/cart/store/useCartStore.ts`، `@/hooks/useHasHydrated.ts`
 */
import { useCallback } from "react";
import { toast } from "sonner";
import { cartItemLineKey } from "@/features/cart/lib/cart-line-key";
import { validateCartLineQuantity } from "@/features/cart/lib/validate-cart-line-quantity";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import type { Product } from "@/features/products/types";

const LINE_UPDATE_MIN_MS = 120;

export type AddProductLineOptions = {
  variationId?: number;
  variationAttributes?: Record<string, string>;
  variationLabel?: string;
  price?: number;
  regularPrice?: number;
  sku?: string;
  thumbnail?: string;
  inStock?: boolean;
};

const cartToast = {
  added() {
    toast.success("أُضيف للسلة", { id: "cart-added" });
  },
  removed() {
    toast.message("أُزيل من السلة", { id: "cart-removed" });
  },
  error(message: string) {
    toast.error(message, { id: "cart-line-error" });
  },
};

function withLineUpdate(lineKey: string, action: () => void) {
  const { setUpdatingLineKey } = useCartStore.getState();
  setUpdatingLineKey(lineKey);
  const started = Date.now();
  try {
    action();
  } finally {
    const wait = Math.max(0, LINE_UPDATE_MIN_MS - (Date.now() - started));
    window.setTimeout(() => {
      if (useCartStore.getState().updatingLineKey === lineKey) {
        setUpdatingLineKey(null);
      }
    }, wait);
  }
}

export function useCart() {
  const hasHydrated = useHasHydrated(useCartStore);
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const updatingLineKey = useCartStore((state) => state.updatingLineKey);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const replaceAllItems = useCartStore((state) => state.replaceAllItems);

  const safeItems = hasHydrated ? items : [];
  const safeTotalItems = hasHydrated ? totalItems : 0;
  const safeTotalPrice = hasHydrated ? totalPrice : 0;

  const setProductLineQuantity = useCallback(
    (product: Product, next: number, options?: AddProductLineOptions) => {
      const q = Math.max(0, Math.floor(next));
      const variationId = options?.variationId;
      const lineKey = cartItemLineKey({
        productId: product.id,
        variationId,
      });
      const { items: liveItems, addToCart: add, removeFromCart: remove, updateQuantity: update } =
        useCartStore.getState();
      const current =
        liveItems.find(
          (i) =>
            i.productId === product.id &&
            (i.variationId ?? 0) === (variationId ?? 0),
        )?.quantity ?? 0;

      if (q === 0) {
        if (current > 0) {
          withLineUpdate(lineKey, () => {
            remove(product.id, variationId);
            cartToast.removed();
          });
        }
        return;
      }

      const stockProduct =
        options?.inStock === false
          ? { ...product, inStock: false }
          : product;
      const validationError = validateCartLineQuantity(stockProduct, q);
      if (validationError) {
        cartToast.error(validationError);
        return;
      }

      if (current === 0) {
        withLineUpdate(lineKey, () => {
          add(product, q, options);
          cartToast.added();
        });
        return;
      }

      if (q !== current) {
        withLineUpdate(lineKey, () => update(product.id, q, variationId));
      }
    },
    [],
  );

  const getCartLineQuantity = useCallback(
    (productId: number, variationId?: number) => {
      if (!hasHydrated) return 0;
      return (
        useCartStore
          .getState()
          .items.find(
            (item) =>
              item.productId === productId &&
              (item.variationId ?? 0) === (variationId ?? 0),
          )?.quantity ?? 0
      );
    },
    [hasHydrated],
  );

  return {
    hasHydrated,
    items: safeItems,
    totalItems: safeTotalItems,
    totalPrice: safeTotalPrice,
    updatingLineKey: hasHydrated ? updatingLineKey : null,
    isEmpty: safeItems.length === 0,
    getCartLineQuantity,
    setProductLineQuantity,
    addProduct(
      product: Product,
      quantity = 1,
      options?: AddProductLineOptions,
    ) {
      const q = Math.max(1, Math.floor(quantity));
      if (options?.inStock === false || (!options?.variationId && !product.inStock)) {
        cartToast.error("المنتج غير متوفر حالياً.");
        return false;
      }
      const validationError = validateCartLineQuantity(product, q);
      if (validationError) {
        cartToast.error(validationError);
        return false;
      }
      const lineKey = cartItemLineKey({
        productId: product.id,
        variationId: options?.variationId,
      });
      withLineUpdate(lineKey, () => {
        addToCart(product, q, options);
        cartToast.added();
      });
      return true;
    },
    removeProduct(productId: number, variationId?: number) {
      const lineKey = cartItemLineKey({ productId, variationId });
      withLineUpdate(lineKey, () => {
        removeFromCart(productId, variationId);
        cartToast.removed();
      });
    },
    updateProductQuantity(
      productId: number,
      quantity: number,
      variationId?: number,
    ) {
      const q = Math.max(0, Math.floor(quantity));
      const lineKey = cartItemLineKey({ productId, variationId });
      if (q <= 0) {
        withLineUpdate(lineKey, () => {
          removeFromCart(productId, variationId);
          cartToast.removed();
        });
        return;
      }
      withLineUpdate(lineKey, () => updateQuantity(productId, q, variationId));
    },
    clearCart,
    replaceAllItems,
  };
}
