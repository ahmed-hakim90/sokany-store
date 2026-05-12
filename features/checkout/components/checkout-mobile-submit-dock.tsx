"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/Button";
import { formatPriceAmountCheckout } from "@/lib/format";
import { formatPrice } from "@/lib/utils";

export type CheckoutMobileSubmitDockProps = {
  total: number;
  itemCount: number;
  visible: boolean;
  disabled: boolean;
  loading: boolean;
  onSubmit: () => void;
};

export function CheckoutMobileSubmitDock({
  total,
  itemCount,
  visible,
  disabled,
  loading,
  onSubmit,
}: CheckoutMobileSubmitDockProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed start-4 end-4 z-40 rounded-3xl border border-white/60 bg-white/90 px-4 py-3 shadow-[0_8px_32px_-10px_rgba(15,23,42,0.18),0_2px_8px_-4px_rgba(15,23,42,0.1)] backdrop-blur-xl backdrop-saturate-150 lg:hidden"
      style={{
        bottom:
          "calc(var(--mobile-commerce-chrome-height, 4.5rem) + max(0.5rem, env(safe-area-inset-bottom)))",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 text-start">
          <div className="flex items-baseline justify-start gap-1.5" dir="ltr">
            <span className="font-display text-2xl font-black tabular-nums tracking-tight text-brand-950">
              {formatPriceAmountCheckout(total)}
            </span>
            <span className="translate-y-px text-[0.7rem] font-semibold text-brand-900/65">
              ج.م
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {itemCount > 0 ? `${itemCount} منتجات` : "السلة فارغة"}
          </p>
          <span className="sr-only">الإجمالي {formatPrice(total)}</span>
        </div>
        <Button
          type="button"
          size="md"
          loading={loading}
          disabled={disabled}
          className="min-h-12 shrink-0 rounded-2xl px-4 text-sm font-bold"
          onClick={onSubmit}
        >
          <span>{loading ? "جاري التأكيد…" : "تأكيد الطلب"}</span>
          <ArrowLeft className="ms-2 h-4 w-4 rtl:rotate-180" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
