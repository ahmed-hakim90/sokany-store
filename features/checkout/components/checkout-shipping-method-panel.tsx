"use client";

import { Truck } from "lucide-react";
import { surfaceEmptyStateClass, surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

export type CheckoutShippingMethodPanelProps = {
  /** عند false: حالة «لا توجد طرق شحن» (مستقبلاً عند ربط Woo). */
  available?: boolean;
  className?: string;
};

/*
 * لوحة طريقة الشحن في إتمام الطلب — حالياً الشحن مجاني دائماً؛
 * عند `available={false}` تُعرض حالة فارغة واضحة بدل اختيار معطّل.
 */
export function CheckoutShippingMethodPanel({
  available = true,
  className,
}: CheckoutShippingMethodPanelProps) {
  if (!available) {
    return (
      <div
        className={cn(surfaceEmptyStateClass, "py-8 text-start", className)}
        role="status"
      >
        <Truck className="mx-auto h-10 w-10 text-brand-900/20" aria-hidden />
        <p className="mt-3 text-sm font-semibold text-brand-950">
          لا تتوفر طرق شحن لهذا العنوان
        </p>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
          راجع المحافظة والمنطقة أو تواصل مع الدعم إذا استمرت المشكلة.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        surfacePanelClass,
        "flex items-start gap-3 border-brand-200/60 bg-gradient-to-l from-brand-50/80 to-white px-3.5 py-3 text-start",
        className,
      )}
      role="status"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/20 text-brand-900">
        <Truck className="h-4 w-4" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold text-brand-950">شحن مجاني لكل المحافظات</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          لا حاجة لاختيار طريقة توصيل إضافية — التوصيل مضمّن في الطلب.
        </p>
      </div>
    </div>
  );
}
