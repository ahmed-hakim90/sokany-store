"use client";

import { ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPriceAmountCheckout } from "@/lib/format";
import { cn, formatPrice } from "@/lib/utils";

/** Sticky checkout strip above `MobileCommerceChrome` — only on small screens. */
export function CartMobileCheckoutDock({
  total,
  onCheckout,
  className,
}: {
  total: number;
  onCheckout: () => void;
  className?: string;
}) {
  const { items, totalItems } = useCart();
  const lineCount = items.length;
  const qtyLabel =
    lineCount > 0
      ? `${lineCount} صنف • ${totalItems} قطعة`
      : `${totalItems} قطعة`;

  return (
    <div
      className={cn(
        "fixed z-40 rounded-3xl border border-white/50 bg-white/80 px-4 py-3 shadow-[0_8px_32px_-10px_rgba(15,23,42,0.14),0_2px_8px_-4px_rgba(15,23,42,0.08)] backdrop-blur-xl backdrop-saturate-150 lg:hidden",
        "start-4 end-4",
        "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        className,
      )}
      style={{
        bottom:
          "calc(var(--mobile-commerce-chrome-height, 4.5rem) + 0.5rem)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1 text-start">
          <div
            className="flex w-full min-w-0 items-baseline justify-end gap-1.5"
            dir="ltr"
          >
            <span className="font-display text-2xl font-black tabular-nums tracking-tight text-brand-950">
              {formatPriceAmountCheckout(total)}
            </span>
            <span className="translate-y-px text-[0.7rem] font-semibold text-brand-900/65">
              ج.م
            </span>
          </div>
          <p className="w-full truncate text-start text-xs text-muted-foreground">
            {qtyLabel}
          </p>
          <span className="sr-only">الإجمالي {formatPrice(total)}</span>
        </div>
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 items-center gap-3 rounded-full border border-brand-800/12 bg-brand-300 py-1.5 ps-5 pe-2 text-sm font-black text-brand-950 shadow-md transition-[transform,colors] hover:bg-brand-400/85 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
            "min-h-11 sm:min-h-12 sm:text-base",
          )}
          onClick={onCheckout}
        >
          <span className="max-w-[7rem] truncate sm:max-w-none">إتمام الطلب</span>
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-950 shadow-sm ring-1 ring-black/[0.06]"
            aria-hidden
          >
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </span>
        </button>
      </div>
    </div>
  );
}
