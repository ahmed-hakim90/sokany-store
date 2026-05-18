"use client";

import { useTransitionRouter } from "next-view-transitions";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/Button";
import { ROUTES } from "@/lib/constants";
import { surfaceEmptyStateClass } from "@/lib/storefront-surfaces";

export function CheckoutEmptyCart() {
  const router = useTransitionRouter();

  return (
    <div className={surfaceEmptyStateClass}>
      <ShoppingBag className="mx-auto h-10 w-10 text-brand-700/70" aria-hidden />
      <p className="mt-3 font-display text-lg font-semibold text-brand-950">
        السلة فارغة
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        أضف منتجات إلى السلة قبل إتمام الطلب.
      </p>
      <Button
        type="button"
        size="lg"
        className="mt-5 min-h-12 font-bold"
        onClick={() => router.push(ROUTES.PRODUCTS)}
      >
        تصفح المنتجات
      </Button>
    </div>
  );
}
