"use client";

import { usePathname } from "next/navigation";
import { StorefrontCouponsStrip } from "@/features/promotions/components/storefront-coupons-strip";
import { useEnabledStorefrontCoupons } from "@/features/promotions/components/storefront-coupons-context";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/*
 * موبايل: شريط الكوبونات ثابت فوق الـ bottom nav في صفحة المنتجات فقط.
 */
export function ProductsCouponsDock() {
  const pathname = usePathname();
  const coupons = useEnabledStorefrontCoupons();
  const onProducts = pathname === ROUTES.PRODUCTS;

  if (!onProducts || coupons.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-[55] lg:hidden",
        "bottom-[var(--mobile-commerce-chrome-height,52px)]",
      )}
    >
      <div className="pointer-events-auto px-3 pb-2 pt-1">
        <StorefrontCouponsStrip variant="dock" />
      </div>
    </div>
  );
}
