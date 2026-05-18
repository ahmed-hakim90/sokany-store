"use client";

import { useCallback, useEffect, useState } from "react";
import type { CmsStorefrontCoupon, CmsStorefrontPromoBar } from "@/schemas/cms";
import { copyPromoCode } from "@/features/promotions/lib/copy-promo-code";
import { isPromoBarDismissed } from "@/features/promotions/lib/promo-bar-dismiss";
import { usePromoBarDismissSync } from "@/features/promotions/hooks/usePromoBarDismissSync";
import { getPromoBarStorefrontCoupons } from "@/features/promotions/lib/storefront-coupons";
import { cn } from "@/lib/utils";

type StorefrontPromoBarProps = {
  config: CmsStorefrontPromoBar;
  coupons: CmsStorefrontCoupon[];
};

export function StorefrontPromoBar({ config, coupons }: StorefrontPromoBarProps) {
  const visibleCoupons = getPromoBarStorefrontCoupons(coupons);
  const coupon = visibleCoupons[0];
  const code = coupon?.code?.trim().toUpperCase() ?? "";

  const dismissRevision = usePromoBarDismissSync();
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!code) {
      setDismissed(true);
      return;
    }
    setDismissed(isPromoBarDismissed(code));
  }, [code, dismissRevision]);

  const handleCopy = useCallback(async () => {
    if (!coupon) return;
    await copyPromoCode(coupon.code, { dismissPromoBar: true });
    setDismissed(true);
  }, [coupon]);

  if (!config.enabled || !coupon || dismissed === null || dismissed) {
    return null;
  }

  return (
    <div className="w-full border-b border-brand-600/20 bg-brand-500">
      <button
        type="button"
        onClick={() => void handleCopy()}
        className={cn(
          "flex w-full flex-col items-center gap-0.5 px-3 py-2 text-center",
          "transition-[filter] hover:brightness-[1.02] active:scale-[0.995]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700",
        )}
        aria-label={`نسخ كود الخصم ${coupon.code}: ${coupon.headline}`}
      >
        <span className="text-xs font-bold text-brand-950 sm:text-sm">
          {coupon.headline}
        </span>
        <span className="text-[11px] text-brand-900/90 sm:text-xs">
          اضغط لنسخ الكود:{" "}
          <span className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-black sm:text-xs">
            {coupon.code}
          </span>
        </span>
      </button>
    </div>
  );
}
