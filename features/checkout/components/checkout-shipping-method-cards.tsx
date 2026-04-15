"use client";

import type { CheckoutFormData } from "@/features/checkout/types";
import { SHIPPING_METHOD_OPTIONS } from "@/features/checkout/shipping-method-options";
import { cn } from "@/lib/utils";

export { SHIPPING_METHOD_OPTIONS } from "@/features/checkout/shipping-method-options";

export type CheckoutShippingMethodCardsProps = {
  value: CheckoutFormData["shippingMethod"];
  onChange: (value: CheckoutFormData["shippingMethod"]) => void;
  error?: string;
  /** When true, omits outer section chrome (for embedding inside another card). */
  embedded?: boolean;
};

export function CheckoutShippingMethodCards({
  value,
  onChange,
  error,
  embedded = false,
}: CheckoutShippingMethodCardsProps) {
  const body = (
    <>
      {!embedded ? (
        <div className="space-y-1">
          <h3 className="font-display text-base font-semibold text-brand-950">طريقة الشحن</h3>
          <p className="text-xs text-muted-foreground">اختر الطريقة المناسبة لتوصيل طلبك.</p>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">طريقة التوصيل</p>
        </div>
      )}
      <div className="grid gap-2" role="radiogroup" aria-label="طريقة الشحن">
        {SHIPPING_METHOD_OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={cn(
                "w-full rounded-xl border-2 px-3 py-2.5 text-start text-sm transition-[border-color,box-shadow,background-color]",
                selected
                  ? "border-brand-500 bg-brand-500/12 shadow-[inset_0_0_0_1px_rgba(218,255,0,0.45)]"
                  : "border-border/80 bg-surface-muted/40 hover:border-brand-500/35 hover:bg-white",
              )}
            >
              <span className="block font-semibold text-brand-950">{opt.title}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="text-start text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );

  if (embedded) {
    return <div className="space-y-3">{body}</div>;
  }

  return (
    <section className="space-y-3 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] sm:p-5">
      {body}
    </section>
  );
}
