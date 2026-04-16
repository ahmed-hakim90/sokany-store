"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useWishlistStore } from "@/features/wishlist/store/useWishlistStore";
import type { Product } from "@/features/products/types";

export function useWishlist() {
  const hasHydrated = useHasHydrated(useWishlistStore);
  const items = useWishlistStore((s) => s.items);
  const addProduct = useWishlistStore((s) => s.addProduct);
  const removeProductStore = useWishlistStore((s) => s.removeProduct);
  const toggleProductStore = useWishlistStore((s) => s.toggleProduct);

  const safeItems = hasHydrated ? items : [];

  const isInWishlist = useCallback(
    (productId: number) => safeItems.some((i) => i.productId === productId),
    [safeItems],
  );

  const toggleWithToast = useCallback(
    (product: Product) => {
      const wasIn = useWishlistStore.getState().items.some((i) => i.productId === product.id);
      toggleProductStore(product);
      if (wasIn) {
        toast.info("تمت إزالة المنتج من المفضلة");
      } else {
        toast.success(`تمت إضافة ${product.name} إلى المفضلة`);
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
      toast.info(name ? `تمت إزالة ${name} من المفضلة` : "تمت الإزالة من المفضلة");
    },
    [removeProductStore],
  );

  const totalCount = useMemo(() => safeItems.length, [safeItems]);

  return {
    hasHydrated,
    items: safeItems,
    totalCount,
    addProduct,
    removeFromWishlist,
    toggleProduct: toggleWithToast,
    isInWishlist,
  };
}
