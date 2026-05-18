"use client";

import { Link } from "next-view-transitions";
import { ChevronLeft, Package, ReceiptText, RotateCcw } from "lucide-react";
import { AppImage } from "@/components/AppImage";
import { PriceText } from "@/components/ui/price-text";
import type { Order } from "@/features/orders/types";
import { orderStatusPresentation } from "@/features/orders/lib/order-status-presentation";
import { ROUTES } from "@/lib/constants";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

export type OrderListCardProps = {
  order: Order;
  onDetailsClick: () => void;
  onReorderClick?: () => void;
  className?: string;
};

export function OrderListCard({
  order,
  onDetailsClick,
  onReorderClick,
  className,
}: OrderListCardProps) {
  const dateLabel = new Date(order.dateCreated).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const st = orderStatusPresentation(order);
  const displayOrderNumber = order.orderNumber || String(order.id);
  const previewItems = order.items.slice(0, 3);
  const remainingItems = Math.max(order.items.length - previewItems.length, 0);
  const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className={cn(
        surfacePanelClass,
        "rounded-3xl p-4 transition-transform sm:p-5",
        "active:scale-[0.99]",
        className,
      )}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(10rem,0.5fr)_minmax(12rem,0.45fr)] lg:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-muted/80 text-brand-900/75">
            <Package className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">طلب رقم</p>
            <h2 className="mt-1 font-display text-lg font-bold text-brand-950">
              #{displayOrderNumber}
            </h2>
            <p className="mt-2 text-xs text-brand-900/55">{dateLabel}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">حالة الطلب</p>
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold",
              st.className,
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
            {st.label}
          </span>
        </div>

        <div className="space-y-1 lg:text-end">
          <p className="text-xs font-medium text-muted-foreground">المبلغ الإجمالي</p>
          <PriceText amount={order.total} emphasized className="text-lg lg:justify-end" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 border-t border-border/60 pt-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-center gap-3">
          {previewItems.length > 0 ? (
            <div className="flex shrink-0 -space-x-3 space-x-reverse">
              {previewItems.map((item) => (
                <div
                  key={item.id}
                  className="relative h-12 w-12 overflow-hidden rounded-xl border border-white bg-image-well shadow-sm ring-1 ring-border/70"
                >
                  <AppImage
                    src={item.image}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              ))}
              {remainingItems > 0 ? (
                <span className="relative z-[1] inline-flex h-12 min-w-12 items-center justify-center rounded-xl bg-brand-950 px-2 text-xs font-bold text-white shadow-sm ring-1 ring-border/70">
                  +{remainingItems}
                </span>
              ) : null}
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-brand-900/45">
              <Package className="h-5 w-5" aria-hidden />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-brand-950">
              {totalItemsCount > 0 ? `${totalItemsCount} منتج` : "لا توجد منتجات"}
            </p>
            {order.items.length > 0 ? (
              <details className="group mt-1">
                <summary className="cursor-pointer list-none text-xs font-medium text-muted-foreground underline-offset-4 hover:text-brand-900 hover:underline marker:hidden [&::-webkit-details-marker]:hidden">
                  عرض المنتجات
                </summary>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-brand-900/70">
                  {order.items.slice(0, 4).map((item) => (
                    <li key={`${item.id}-${item.productId}`} className="line-clamp-1">
                      {item.quantity}× {item.name}
                    </li>
                  ))}
                  {order.items.length > 4 ? (
                    <li className="font-medium text-brand-900">
                      و{order.items.length - 4} منتج آخر
                    </li>
                  ) : null}
                </ul>
              </details>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-950 px-4 text-sm font-bold text-white transition-colors hover:bg-brand-900"
            onClick={onDetailsClick}
          >
            تفاصيل الطلب
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          {onReorderClick ? (
            <button
              type="button"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-brand-950 transition-colors hover:bg-surface-muted"
              onClick={onReorderClick}
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              إعادة الطلب
            </button>
          ) : null}
          <Link
            href={`${ROUTES.ORDER_TRACKING}?q=${encodeURIComponent(String(order.id))}`}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-brand-950 transition-colors hover:bg-surface-muted"
          >
            <ReceiptText className="h-4 w-4" aria-hidden />
            عرض الفاتورة
          </Link>
        </div>
      </div>
    </div>
  );
}
