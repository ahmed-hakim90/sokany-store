"use client";

import type { CmsStorefrontCoupon } from "@/schemas/cms";
import { copyPromoCode } from "@/features/promotions/lib/copy-promo-code";
import { cn } from "@/lib/utils";

export type StorefrontCouponCardProps = {
  coupon: CmsStorefrontCoupon;
  className?: string;
  /** `dock`: عرض مضغوط فوق شريط التنقل السفلي. */
  variant?: "default" | "dock";
};

export function StorefrontCouponCard({
  coupon,
  className,
  variant = "default",
}: StorefrontCouponCardProps) {
  const isDock = variant === "dock";

  return (
    <button
      type="button"
      onClick={() => void copyPromoCode(coupon.code, { dismissPromoBar: true })}
      className={cn(
        "w-full shrink-0 rounded-2xl border border-brand-500/35 bg-brand-500 text-start shadow-[0_8px_24px_-16px_rgba(15,23,42,0.35)] transition-[transform,box-shadow] duration-200",
        "hover:brightness-[1.02] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
        isDock ? "min-w-[min(100%,20rem)] px-3.5 py-2.5" : "px-4 py-3",
        className,
      )}
      aria-label={`نسخ كود الخصم ${coupon.code}: ${coupon.headline}`}
    >
      <p
        className={cn(
          "font-bold text-brand-950",
          isDock ? "text-xs sm:text-sm" : "text-sm",
        )}
      >
        {coupon.headline}
      </p>
      {coupon.subline?.trim() ? (
        <p className="mt-0.5 text-[11px] leading-snug text-brand-900/85">{coupon.subline}</p>
      ) : null}
      <p className="mt-1 text-[11px] text-brand-900/90 sm:text-xs">
        اضغط لنسخ الكود:{" "}
        <span className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-black sm:text-xs">
          {coupon.code}
        </span>
      </p>
    </button>
  );
}
