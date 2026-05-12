"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { AppImage } from "@/components/AppImage";
import { Card } from "@/components/ui/card";
import { PriceText } from "@/components/ui/price-text";
import { cn, formatPrice } from "@/lib/utils";
import type { CartItem } from "@/features/cart/types";

export type CheckoutSummaryProps = {
  items: CartItem[];
  subtotal: number;
  total: number;
  shippingAmount: number;
  discountAmount?: number;
  shippingLabel?: string;
  className?: string;
  previewLimit?: number;
};

export function CheckoutSummary({
  items,
  subtotal,
  total,
  shippingAmount,
  discountAmount = 0,
  shippingLabel = "الشحن",
  className,
  previewLimit = 5,
}: CheckoutSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const preview = items.slice(0, previewLimit);
  const rest = items.length - preview.length;
  const shippingDisplay =
    shippingAmount > 0 ? formatPrice(shippingAmount) : "مجاني";

  return (
    <Card
      variant="summary"
      className={cn(
        "h-fit rounded-2xl border-black/[0.05] p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold tracking-tight text-brand-950">
          ملخص الطلب
        </h2>
        <div className="flex items-center gap-2">
          {items.length > 0 ? (
            <span className="text-[11px] text-muted-foreground">{items.length} منتجات</span>
          ) : null}
          {items.length > 0 ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full bg-page px-2.5 py-1 text-[11px] font-bold text-brand-950 transition hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 lg:hidden"
              onClick={() => setIsExpanded((next) => !next)}
              aria-expanded={isExpanded}
              aria-controls="checkout-summary-items"
            >
              {isExpanded ? "إخفاء المنتجات" : "عرض المنتجات"}
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition", isExpanded && "rotate-180")}
                aria-hidden
              />
            </button>
          ) : null}
        </div>
      </div>

      {preview.length > 0 ? (
        <ul
          id="checkout-summary-items"
          className={cn("mt-4 space-y-2.5", !isExpanded && "hidden lg:block")}
        >
          {preview.map((item) => (
            <li
              key={item.productId}
              className="flex min-w-0 gap-3 rounded-xl border border-border/60 bg-page/35 p-3"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-image-well">
                <AppImage src={item.thumbnail} alt="" fill sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium leading-snug text-brand-950">
                  {item.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">الكمية: {item.quantity}</p>
              </div>
              <span
                className="shrink-0 self-center text-sm font-semibold tabular-nums text-brand-950"
                dir="ltr"
              >
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">لا توجد منتجات في السلة.</p>
      )}
      {rest > 0 ? (
        <p
          className={cn(
            "mt-2 text-center text-[11px] text-muted-foreground",
            !isExpanded && "hidden lg:block",
          )}
        >
          +{rest} منتجات إضافية
        </p>
      ) : null}

      <div className="mt-4 space-y-2.5 border-t border-border/70 pt-4 text-sm">
        <div className="flex items-center justify-between gap-3 text-muted-foreground">
          <span>المجموع الفرعي</span>
          <span className="font-medium tabular-nums text-brand-950/90" dir="ltr">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="flex items-start justify-between gap-3 text-muted-foreground">
          <span className="min-w-0">
            الشحن
            {shippingLabel ? (
              <span className="mt-0.5 block text-[11px] text-muted-foreground/90">
                {shippingLabel}
              </span>
            ) : null}
          </span>
          <span className="shrink-0 font-medium tabular-nums text-brand-950/90" dir="ltr">
            {shippingDisplay}
          </span>
        </div>
        {discountAmount > 0 ? (
          <div className="flex items-center justify-between gap-3 text-emerald-700">
            <span>خصم</span>
            <span className="font-medium tabular-nums" dir="ltr">
              - {formatPrice(discountAmount)}
            </span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-base font-semibold text-brand-950">
          <span>الإجمالي</span>
          <PriceText amount={total} emphasized className="text-base text-brand-950" />
        </div>
      </div>
    </Card>
  );
}
