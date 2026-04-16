import type { ReactNode } from "react";
import Link from "next/link";
import { AppImage } from "@/components/AppImage";
import { Card } from "@/components/ui/card";
import { PriceText } from "@/components/ui/price-text";
import { ROUTES } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import type { CartItem } from "@/features/cart/types";

export type CartSummaryPanelProps = {
  items: CartItem[];
  subtotal: number;
  total: number;
  shippingLabel?: string;
  /** Shown below totals (e.g. checkout button). */
  footer?: ReactNode;
  className?: string;
  previewLimit?: number;
};

export function CartSummaryPanel({
  items,
  subtotal,
  total,
  shippingLabel = "يُحسب عند الطلب",
  footer,
  className,
  previewLimit = 4,
}: CartSummaryPanelProps) {
  const preview = items.slice(0, previewLimit);
  const rest = items.length - preview.length;

  return (
    <Card variant="summary" className={cn("h-fit", className)}>
      <h2 className="font-display text-lg font-semibold text-brand-950">
        ملخص الطلب
      </h2>
      {preview.length > 0 ? (
        <ul className="mt-4 space-y-3 border-b border-border pb-4">
          {preview.map((item) => (
            <li key={item.productId} className="flex gap-3 text-sm">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-image-well">
                <AppImage
                  src={item.thumbnail}
                  alt={item.name}
                  fill
                  sizes="56px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={ROUTES.PRODUCT(item.productId)}
                  className="line-clamp-2 font-medium text-foreground transition-colors hover:text-brand-600"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  ×{item.quantity} · {formatPrice(item.price)} each
                </p>
              </div>
              <PriceText
                amount={item.price * item.quantity}
                compact
                className="shrink-0 self-start"
              />
            </li>
          ))}
        </ul>
      ) : null}
      {rest > 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">+{rest} منتجات إضافية</p>
      ) : null}
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>المجموع الفرعي</span>
          <span dir="ltr">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>الشحن</span>
          <span>{shippingLabel}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-brand-950">
          <span>الإجمالي</span>
          <PriceText amount={total} emphasized className="text-brand-950" />
        </div>
      </div>
      {footer ? <div className="mt-6">{footer}</div> : null}
    </Card>
  );
}
