"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { AppImage } from "@/components/AppImage";
import { mobileCartCompactPeekClass } from "@/components/layout/mobile-commerce-surface";
import type { CartItem } from "@/features/cart/types";
import { formatPriceAmountCheckout } from "@/lib/format";
import { cn, formatPrice } from "@/lib/utils";

const PREVIEW_COUNT = 3;
const THUMB_SIZE_CLASS = "h-9 w-9";

export type MobileCartCompactPeekProps = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  hasHydrated: boolean;
  drawerOpen?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children">;

function cartPiecesLabel(totalItems: number): string {
  return totalItems === 1 ? "قطعة واحدة" : `${totalItems} قطعة`;
}

function cartPeekAriaSummary(totalItems: number, totalPrice: number): string {
  return `${cartPiecesLabel(totalItems)}، الإجمالي ${formatPrice(totalPrice)}`;
}

export const MobileCartCompactPeek = forwardRef<
  HTMLButtonElement,
  MobileCartCompactPeekProps
>(function MobileCartCompactPeek(
  {
    items,
    totalItems,
    totalPrice,
    hasHydrated,
    drawerOpen = false,
    className,
    "aria-label": ariaLabelProp,
    ...buttonProps
  },
  ref,
) {
  const previews = items.slice(0, PREVIEW_COUNT);
  const summaryAria = cartPeekAriaSummary(totalItems, totalPrice);
  const ariaLabel =
    ariaLabelProp ??
    (drawerOpen ? "إغلاق تفاصيل السلة" : `عرض السلة، ${summaryAria}`);

  return (
    <button
      ref={ref}
      type="button"
      {...buttonProps}
      className={cn(
        mobileCartCompactPeekClass,
        "inline-flex bg-brand-500  max-w-full min-w-0 items-center gap-3 px-3 py-2 outline-none transition-[transform,box-shadow] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-500 disabled:pointer-events-none disabled:opacity-80" 
      )}
      aria-expanded={drawerOpen}
      aria-haspopup="dialog"
      aria-label={ariaLabel}
    >
      <span className="flex shrink-0 items-center" aria-hidden>
        {!hasHydrated ? (
          <CompactPeekThumbSkeleton count={Math.min(items.length || 2, PREVIEW_COUNT)} />
        ) : previews.length > 0 ? (
          previews.map((item, index) => (
            <span
              key={item.productId}
              className={cn(
                "relative overflow-hidden rounded-full bg-white ring-2 ring-white",
                THUMB_SIZE_CLASS,
                index > 0 && "-ms-2.5",
              )}
              style={{ zIndex: index + 1 }}
            >
              <AppImage
                src={item.thumbnail}
                alt=""
                fill
                sizes="36px"
                className="object-cover"
              />
            </span>
          ))
        ) : (
          <span
            className={cn(
              "flex items-center justify-center rounded-full bg-white/20 text-lg",
              THUMB_SIZE_CLASS,
            )}
          >
            🛒
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 text-start leading-tight text-brand-950">
        <span className="block truncate text-sm font-bold">عرض السلة</span>
        {!hasHydrated ? (
          <span
            className="mt-0.5 block h-3.5 w-[7.5rem] max-w-full animate-pulse rounded-full bg-white/30"
            aria-hidden
          />
        ) : (
          <span className="mt-0.5 flex min-w-0 max-w-full items-baseline gap-1.5 truncate text-xs font-medium text-brand-950/90">
            <span className="shrink-0">{cartPiecesLabel(totalItems)}</span>
            <span aria-hidden className="shrink-0 text-brand-950/70">
              •
            </span>
            <span
              dir="ltr"
              className="inline-flex min-w-0 shrink items-baseline gap-0.5 tabular-nums font-semibold text-brand-950"
            >
              <span className="truncate">
                {formatPriceAmountCheckout(totalPrice)}
              </span>
              <span className="shrink-0 text-[0.65rem] font-medium text-brand-950/90">
                ج.م
              </span>
            </span>
          </span>
        )}
      </span>
    </button>
  );
});

function CompactPeekThumbSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "animate-pulse rounded-full bg-white/35 ring-2 ring-white/50",
            THUMB_SIZE_CLASS,
            index > 0 && "-ms-2.5",
          )}
          style={{ zIndex: index + 1 }}
        />
      ))}
    </>
  );
}
