"use client";

import { useMemo } from "react";
import { useEnabledStorefrontCoupons } from "@/features/promotions/components/storefront-coupons-context";
import { StorefrontCouponCard } from "@/features/promotions/components/storefront-coupon-card";
import { usePromoBarDismissSync } from "@/features/promotions/hooks/usePromoBarDismissSync";
import { isPromoBarDismissed } from "@/features/promotions/lib/promo-bar-dismiss";
import { cn } from "@/lib/utils";

export type StorefrontCouponsStripProps = {
  className?: string;
  /** `dock`: شريط أفقي مضغوط (موبايل فوق الـ bottom nav). */
  variant?: "default" | "dock";
};

export function StorefrontCouponsStrip({
  className,
  variant = "default",
}: StorefrontCouponsStripProps) {
  const allCoupons = useEnabledStorefrontCoupons();
  const dismissRevision = usePromoBarDismissSync();
  const coupons = useMemo(
    () =>
      allCoupons.filter(
        (c) => !isPromoBarDismissed(c.code),
      ),
    [allCoupons, dismissRevision],
  );
  if (coupons.length === 0) return null;

  const isDock = variant === "dock";

  return (
    <section
      className={cn("min-w-0", className)}
      aria-label="أكواد الخصم"
    >
      <div
        className={cn(
          isDock
            ? "flex gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3",
        )}
      >
        {coupons.map((coupon) => (
          <StorefrontCouponCard
            key={coupon.id}
            coupon={coupon}
            variant={variant}
            className={isDock ? "snap-start" : "sm:max-w-sm sm:flex-1"}
          />
        ))}
      </div>
    </section>
  );
}
