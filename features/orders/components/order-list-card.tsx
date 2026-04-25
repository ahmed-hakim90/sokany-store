"use client";

import { Link } from "next-view-transitions";
import { Package } from "lucide-react";
import { PriceText } from "@/components/ui/price-text";
import type { Order } from "@/features/orders/types";
import { orderStatusPresentation } from "@/features/orders/lib/order-status-presentation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type OrderListCardProps = {
  order: Order;
  onDetailsClick: () => void;
  className?: string;
};

export function OrderListCard({ order, onDetailsClick, className }: OrderListCardProps) {
  const dateLabel = new Date(order.dateCreated).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const st = orderStatusPresentation(order);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border/80 bg-white p-4 shadow-sm transition-transform sm:flex-row sm:items-center sm:justify-between sm:p-5",
        "active:scale-[0.99]",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-muted/80 text-brand-900/70">
          <Package className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold text-brand-950">طلب رقم #{order.id}</h2>
          <p className="mt-1 text-xs text-brand-900/50">{dateLabel}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:flex-col sm:items-end sm:justify-center">
        <PriceText amount={order.total} emphasized className="text-lg" />
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold",
            st.className,
          )}
        >
          {st.label}
        </span>
        <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
          <Link
            href={`${ROUTES.ORDER_TRACKING}?q=${encodeURIComponent(String(order.id))}`}
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
          >
            تتبع الطلب
          </Link>
          <button
            type="button"
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-border bg-white px-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
            onClick={onDetailsClick}
          >
            تفاصيل
          </button>
        </div>
      </div>
    </div>
  );
}
