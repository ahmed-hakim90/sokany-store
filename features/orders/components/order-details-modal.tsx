"use client";

import { createPortal } from "react-dom";
import { Link } from "next-view-transitions";
import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { IconButton } from "@/components/ui/icon-button";
import { PriceText } from "@/components/ui/price-text";
import { formatWooCouponLines, formatWooShippingLines } from "@/features/orders/lib/woo-excess-labels";
import type { BillingAddress, ShippingAddress } from "@/features/user/types";
import type { Order } from "@/features/orders/types";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export type OrderDetailsModalProps = {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Guest: تعديل الطلب (قد يُسمح وهو قيد التجهيز بينما الإلغاء لا). */
  canAmend?: boolean;
  /** Guest: إلغاء الطلب (عادة ‎pending‎ / ‎on-hold‎ فقط). */
  canCancel?: boolean;
  onAmend?: () => void;
  onCancel?: () => void;
  cancelPending?: boolean;
};

function subscribeStaticSnapshot() {
  return () => {};
}

function formatPersonLines(addr: Pick<BillingAddress, "firstName" | "lastName" | "company">): string[] {
  const name = [addr.firstName, addr.lastName].filter((s) => s?.trim()).join(" ").trim();
  const lines: string[] = [];
  if (name) lines.push(name);
  if (addr.company?.trim()) lines.push(addr.company.trim());
  return lines;
}

function formatStreetCityLines(
  addr: Pick<BillingAddress, "address1" | "address2" | "city" | "state" | "postcode" | "country">,
): string[] {
  const lines: string[] = [];
  if (addr.address1?.trim()) lines.push(addr.address1.trim());
  if (addr.address2?.trim()) lines.push(addr.address2.trim());
  const cityLine = [addr.city, addr.state, addr.postcode].filter((s) => s?.trim()).join(" ").trim();
  if (cityLine) lines.push(cityLine);
  if (addr.country?.trim()) lines.push(addr.country.trim());
  return lines;
}

export function OrderDetailsModal({
  order,
  open,
  onOpenChange,
  canAmend = false,
  canCancel = false,
  onAmend,
  onCancel,
  cancelPending = false,
}: OrderDetailsModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const mounted = useSyncExternalStore(subscribeStaticSnapshot, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    const t = requestAnimationFrame(() => {
      closeRef.current?.focus();
    });
    return () => cancelAnimationFrame(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open || !order) {
    return null;
  }

  const dateLabel = new Date(order.dateCreated).toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const billing = order.billing;
  const shipping = order.shipping as ShippingAddress;

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-white shadow-2xl sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border/80 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-lg font-semibold text-brand-950">
              طلب #{order.id}
            </h2>
            <p className="mt-1 text-xs text-brand-900/60">{dateLabel}</p>
          </div>
          <IconButton
            ref={closeRef}
            type="button"
            variant="subtle"
            size="sm"
            aria-label="إغلاق"
            className="shrink-0"
            onClick={() => onOpenChange(false)}
          >
            <CloseIcon />
          </IconButton>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
          <div className="space-y-4 rounded-xl border border-border/70 bg-surface-muted/25 p-3 text-sm text-brand-900/90">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-900/55">
                بيانات التواصل
              </p>
              <ul className="mt-2 space-y-1.5 text-brand-950">
                {formatPersonLines(billing).map((line) => (
                  <li key={line}>{line}</li>
                ))}
                {billing.email?.trim() ? (
                  <li dir="ltr" className="break-all text-brand-900/85">
                    {billing.email.trim()}
                  </li>
                ) : null}
                {billing.phone?.trim() ? (
                  <li dir="ltr" className="tabular-nums text-brand-900/85">
                    {billing.phone.trim()}
                  </li>
                ) : null}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-900/55">
                عنوان الشحن
              </p>
              <ul className="mt-2 space-y-1.5 text-brand-950">
                {formatPersonLines(shipping).map((line) => (
                  <li key={`s-${line}`}>{line}</li>
                ))}
                {formatStreetCityLines(shipping).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            {order.customerNote?.trim() ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-900/55">
                  ملاحظة على الطلب
                </p>
                <p className="mt-2 whitespace-pre-wrap text-brand-900/85">{order.customerNote.trim()}</p>
              </div>
            ) : null}
          </div>

          <p className="mt-6 text-sm font-medium text-brand-950">المنتجات</p>
          <ul className="mt-3 space-y-3">
            {order.items.map((line) => (
              <li
                key={line.id}
                className="flex gap-3 rounded-xl border border-border/70 bg-surface-muted/20 p-2.5"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                  <AppImage
                    src={line.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug text-brand-950">{line.name}</p>
                  <p className="mt-1 text-xs text-brand-900/60">الكمية: {line.quantity}</p>
                  {line.wooExcess?.variation_id != null ? (
                    <p className="mt-0.5 text-xs text-brand-900/50">
                      تنويع: {String(line.wooExcess.variation_id)}
                    </p>
                  ) : null}
                  {line.wooExcess?.sku != null && String(line.wooExcess.sku).trim() !== "" ? (
                    <p className="mt-0.5 text-xs text-brand-900/50">SKU: {String(line.wooExcess.sku)}</p>
                  ) : null}
                  <p className="mt-1 text-sm font-semibold text-brand-800">
                    {formatPrice(line.total)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {order.wooExcess && (
            <div className="mt-6 space-y-3 border-t border-border/60 pt-4 text-sm text-brand-900/80">
              {formatWooShippingLines(order.wooExcess.shipping_lines) && (
                <p>
                  <span className="font-medium text-brand-950">الشحن: </span>
                  {formatWooShippingLines(order.wooExcess.shipping_lines)}
                </p>
              )}
              {formatWooCouponLines(order.wooExcess.coupon_lines) && (
                <p>
                  <span className="font-medium text-brand-950">كوبونات: </span>
                  {formatWooCouponLines(order.wooExcess.coupon_lines)}
                </p>
              )}
            </div>
          )}
        </div>

        <footer className="shrink-0 space-y-3 border-t border-border/80 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-2">
            <Link
              href={`${ROUTES.ORDER_TRACKING}?q=${encodeURIComponent(String(order.id))}`}
              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-border bg-white text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            >
              تتبع الطلب
            </Link>
            {canAmend && onAmend ? (
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full font-semibold"
                onClick={() => {
                  onAmend();
                  onOpenChange(false);
                }}
              >
                تعديل الطلب (إضافة منتجات)
              </Button>
            ) : null}
            {canCancel && onCancel ? (
              <Button
                type="button"
                variant="ghost"
                size="md"
                className="w-full font-semibold text-red-700 hover:bg-red-50"
                loading={cancelPending}
                disabled={cancelPending}
                onClick={() => onCancel()}
              >
                إلغاء الطلب
              </Button>
            ) : null}
          </div>
          <div className="space-y-1.5 text-sm text-brand-900/75">
            <div className="flex items-center justify-between gap-2">
              <span>المجموع الفرعي</span>
              <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
            </div>
            {order.totalTax > 0 ? (
              <div className="flex items-center justify-between gap-2">
                <span>الضريبة</span>
                <span className="tabular-nums">{formatPrice(order.totalTax)}</span>
              </div>
            ) : null}
            {order.shippingTotal > 0 ? (
              <div className="flex items-center justify-between gap-2">
                <span>تكلفة الشحن (مُجمّع)</span>
                <span className="tabular-nums">{formatPrice(order.shippingTotal)}</span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
            <span className="text-sm font-medium text-brand-900/70">الإجمالي</span>
            <PriceText amount={order.total} emphasized className="text-lg" />
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
