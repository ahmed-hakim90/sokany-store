"use client";

import { memo, type ReactNode } from "react";
import { ArrowLeft, LockKeyhole, ShieldCheck, Truck } from "lucide-react";
import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { PriceText } from "@/components/ui/price-text";
import { QtyControl } from "@/components/ui/qty-control";
import { IconButton } from "@/components/ui/icon-button";
import { ROUTES } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import type { CartItem } from "@/features/cart/types";

export type CartLinesVariant = "default" | "premium";

export const CART_CHECKOUT_CTA_LABEL = "إتمام الطلب";
export const cartCheckoutPillButtonClassName =
  "inline-flex shrink-0 items-center gap-3 rounded-full border border-brand-800/12 bg-brand-300 py-1.5 ps-5 pe-2 text-sm font-black text-brand-950 shadow-md transition-[transform,background-color,box-shadow] hover:bg-brand-400/85 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";
export const cartCheckoutPillIconClassName =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-950 shadow-sm ring-1 ring-black/[0.06]";

export function getCartDrawerDiscount(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    if (!item.regularPrice || item.regularPrice <= item.price) return sum;
    return sum + (item.regularPrice - item.price) * item.quantity;
  }, 0);
}

export function CartDrawerLines({
  items,
  onQuantityChange,
  onRemove,
  listClassName,
  variant = "default",
}: {
  items: CartItem[];
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  listClassName?: string;
  variant?: CartLinesVariant;
}) {
  return (
    <ul
      className={
        listClassName ??
        cn("pb-3", variant === "premium" ? "space-y-3" : "space-y-2.5")
      }
      role="list"
    >
      {items.map((item) => (
        <CartSheetLine
          key={item.productId}
          item={item}
          variant={variant}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}

export function CartDrawerPeekFooter({
  onCheckout,
  showFullCartLink,
  subtotal,
  total,
  shippingLabel,
  discount = 0,
  children,
  variant = "default",
}: {
  onCheckout: () => void;
  showFullCartLink?: boolean;
  subtotal?: number;
  total?: number;
  shippingLabel?: string;
  discount?: number;
  children?: ReactNode;
  variant?: CartLinesVariant;
}) {
  const premium = variant === "premium";
  const showSummary =
    typeof subtotal === "number" &&
    typeof total === "number" &&
    typeof shippingLabel === "string";
  return (
    <div
      className={cn(
        "shrink-0 px-4 pb-4 pt-3",
        premium
          ? "rounded-b-[1.35rem] border-t border-white/40 bg-white/50 backdrop-blur-md"
          : "border-t border-border bg-white shadow-[0_-4px_20px_-6px_rgba(15,23,42,0.08)]",
      )}
    >
      {showSummary ? (
        <CartDrawerSummaryRows
          subtotal={subtotal}
          total={total}
          shippingLabel={shippingLabel}
          discount={discount}
          className={premium ? "mb-3" : "mb-4"}
        />
      ) : null}
      {premium ? (
        <button
          type="button"
          className={cn(
            cartCheckoutPillButtonClassName,
            "w-full min-w-0 justify-between py-2.5 sm:text-base",
          )}
          onClick={onCheckout}
        >
          <span className="min-w-0 truncate">{CART_CHECKOUT_CTA_LABEL}</span>
          <span
            className={cartCheckoutPillIconClassName}
            aria-hidden
          >
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </span>
        </button>
      ) : (
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="min-w-0 max-w-none font-bold"
          onClick={onCheckout}
        >
          {CART_CHECKOUT_CTA_LABEL}
        </Button>
      )}
      {showFullCartLink ? (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          <Link
            href={ROUTES.CART}
            className="font-medium text-brand-800 underline-offset-2 hover:underline"
          >
            عرض السلة بالكامل
          </Link>
        </p>
      ) : null}
      {children ?? <CartDrawerTrustBadges className="mt-4" />}
    </div>
  );
}

export function CartDrawerSummaryRows({
  subtotal,
  total,
  shippingLabel,
  discount = 0,
  className,
}: {
  subtotal: number;
  total: number;
  shippingLabel: string;
  discount?: number;
  className?: string;
}) {
  const roundedDiscount = Math.max(0, Math.round(discount));

  return (
    <div className={cn("space-y-2 text-sm", className)}>
      <div className="flex items-center justify-between gap-3 text-muted-foreground">
        <span>المجموع الفرعي</span>
        <span dir="ltr">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-muted-foreground">
        <span>تكلفة الشحن</span>
        <span className="text-start font-semibold text-foreground">{shippingLabel}</span>
      </div>
      {roundedDiscount > 0 ? (
        <div className="flex items-center justify-between gap-3 text-emerald-700">
          <span>خصم</span>
          <span dir="ltr">- {formatPrice(roundedDiscount)}</span>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3 border-t border-border/80 pt-3 text-base font-black text-brand-950">
        <span>الإجمالي</span>
        <PriceText amount={total} emphasized className="text-brand-950" />
      </div>
    </div>
  );
}

export function CartDrawerTrustBadges({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-slate-600",
        className,
      )}
      aria-label="مميزات الطلب"
    >
      <CartDrawerTrustBadge icon={<LockKeyhole className="size-4" />} label="دفع 100% آمن" />
      <CartDrawerTrustBadge icon={<ShieldCheck className="size-4" />} label="ضمان سنتين" />
      <CartDrawerTrustBadge icon={<Truck className="size-4" />} label="توصيل سريع" />
    </div>
  );
}

function CartDrawerTrustBadge({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 rounded-xl bg-slate-50 px-2 py-2 ring-1 ring-slate-900/[0.06]">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-950 shadow-sm ring-1 ring-slate-900/[0.06]"
        aria-hidden
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </div>
  );
}

const CartSheetLine = memo(function CartSheetLine({
  item,
  onQuantityChange,
  onRemove,
  variant = "default",
}: {
  item: CartItem;
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  variant?: CartLinesVariant;
}) {
  const premium = variant === "premium";
  return (
    <li
      className={cn(
        "flex gap-3 p-3",
        premium
          ? "rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.2)] ring-1 ring-slate-900/[0.04] backdrop-blur-sm"
          : "rounded-xl border border-border/80 bg-white shadow-sm",
      )}
    >
      <Link
        href={ROUTES.PRODUCT(item.productId)}
        className={cn(
          "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-image-well",
          premium ? "border-slate-200/80" : "border-border",
        )}
      >
        <AppImage
          src={item.thumbnail}
          alt=""
          fill
          sizes="64px"
          className="object-cover"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={ROUTES.PRODUCT(item.productId)}
            className={cn(
              "line-clamp-2 text-start text-sm font-semibold hover:text-brand-600",
              premium ? "text-slate-900" : "text-foreground",
            )}
          >
            {item.name}
          </Link>
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "shrink-0 hover:text-red-600",
              premium ? "text-slate-400 hover:bg-slate-100" : "text-muted-foreground",
            )}
            aria-label={`إزالة ${item.name}`}
            onClick={() => onRemove(item.productId)}
          >
            <CartTrashIcon />
          </IconButton>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm font-semibold",
              premium ? "text-slate-600" : "text-brand-900",
            )}
            dir="ltr"
          >
            {formatPrice(item.price)}
          </span>
          <QtyControl
            value={item.quantity}
            min={1}
            max={999}
            touchComfortable={!premium}
            compact={premium}
            onChange={(q) => onQuantityChange(item.productId, q)}
          />
        </div>
        <div className="flex justify-end">
          <PriceText
            amount={item.price * item.quantity}
            compact
            className={cn(
              "text-xs",
              premium ? "text-slate-500" : "text-muted-foreground",
            )}
          />
        </div>
      </div>
    </li>
  );
});

export function CartTrashIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14" strokeLinecap="round" />
      <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round" />
    </svg>
  );
}
