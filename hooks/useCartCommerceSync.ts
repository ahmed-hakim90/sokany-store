"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { syncCartWithServer } from "@/features/cart/lib/sync-cart-with-server";
import { useCartStore } from "@/features/cart/store/useCartStore";

/**
 * عند فتح السلة أو الدفع: مزامنة الأسعار والمخزون مع السيرفر.
 */
export function useCartCommerceSync(enabled: boolean) {
  const items = useCartStore((s) => s.items);
  const replaceAllItems = useCartStore((s) => s.replaceAllItems);
  const ranForItemsRef = useRef("");

  useEffect(() => {
    if (!enabled || items.length === 0) return;

    const signature = items
      .map((i) => `${i.productId}:${i.variationId ?? 0}:${i.quantity}`)
      .join("|");
    if (ranForItemsRef.current === signature) return;

    let cancelled = false;
    void (async () => {
      try {
        const result = await syncCartWithServer(items);
        if (cancelled) return;
        ranForItemsRef.current = signature;

        if (result.items.length !== items.length || result.issues.length > 0) {
          replaceAllItems(result.items);
        }

        const priceUpdates = result.issues.filter((i) => i.kind === "price_changed");
        const removed = result.issues.filter(
          (i) => i.kind === "not_found" || i.kind === "out_of_stock",
        );

        if (removed.length > 0) {
          toast.error("تمت إزالة أصناف غير متوفرة من السلة.", { id: "cart-sync-removed" });
        } else if (priceUpdates.length > 0) {
          toast.message("تم تحديث الأسعار وفق أحدث بيانات المتجر.", {
            id: "cart-sync-price",
          });
        }
      } catch {
        if (!cancelled) {
          toast.error("تعذر التحقق من أحدث الأسعار. حاول تحديث الصفحة.", {
            id: "cart-sync-error",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, items, replaceAllItems]);
}
