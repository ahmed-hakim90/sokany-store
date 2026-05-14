"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useWishlistStore } from "@/features/wishlist/store/useWishlistStore";
import type { Product } from "@/features/products/types";

const wishlistToast = {
  added(product: Product) {
    toast.dismiss(`wishlist-removed-${product.id}`);
    toast.success("تمت الإضافة للمفضلة", {
      id: `wishlist-added-${product.id}`,
      description: product.name,
    });
  },
  removed(productId: number, name?: string) {
    toast.dismiss(`wishlist-added-${productId}`);
    toast.info("تمت الإزالة من المفضلة", {
      id: `wishlist-removed-${productId}`,
      description: name,
    });
  },
  cleared(count: number) {
    toast.info("تم تفريغ المفضلة", {
      id: "wishlist-cleared",
      description: `${count} منتج`,
    });
  },
};

export function useWishlist() {
  const hasHydrated = useHasHydrated(useWishlistStore);
  const items = useWishlistStore((s) => s.items);
  const addProduct = useWishlistStore((s) => s.addProduct);
  const removeProductStore = useWishlistStore((s) => s.removeProduct);
  const clearAllStore = useWishlistStore((s) => s.clearAll);
  const toggleProductStore = useWishlistStore((s) => s.toggleProduct);

  const safeItems = useMemo(() => (hasHydrated ? items : []), [hasHydrated, items]);

  const isInWishlist = useCallback(
    (productId: number) => safeItems.some((i) => i.productId === productId),
    [safeItems],
  );

  const toggleWithToast = useCallback(
    (product: Product) => {
      const wasIn = useWishlistStore.getState().items.some((i) => i.productId === product.id);
      toggleProductStore(product);
      if (wasIn) {
        wishlistToast.removed(product.id, product.name);
      } else {
        wishlistToast.added(product);
      }
    },
    [toggleProductStore],
  );

  const removeFromWishlist = useCallback(
    (productId: number) => {
      const name = useWishlistStore
        .getState()
        .items.find((i) => i.productId === productId)?.name;
      removeProductStore(productId);
      wishlistToast.removed(productId, name);
    },
    [removeProductStore],
  );

  const totalCount = useMemo(() => safeItems.length, [safeItems]);

  const clearAll = useCallback(() => {
    const count = useWishlistStore.getState().items.length;
    if (count === 0) return;
    clearAllStore();
    wishlistToast.cleared(count);
  }, [clearAllStore]);

  return {
    hasHydrated,
    items: safeItems,
    totalCount,
    addProduct,
    removeFromWishlist,
    clearAll,
    toggleProduct: toggleWithToast,
    isInWishlist,
  };
}
