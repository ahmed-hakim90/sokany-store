"use client";

import { memo } from "react";
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
  variant = "default",
}: {
  onCheckout: () => void;
  showFullCartLink?: boolean;
  variant?: CartLinesVariant;
}) {
  const premium = variant === "premium";
  return (
    <div
      className={cn(
        "shrink-0 px-4 pb-4 pt-3",
        premium
          ? "rounded-b-[1.35rem] border-t border-slate-200/70 bg-slate-100/40 backdrop-blur-md"
          : "border-t border-border bg-white shadow-[0_-4px_20px_-6px_rgba(15,23,42,0.08)]",
      )}
    >
      <Button
        type="button"
        variant="primary"
        size="lg"
        className={cn(
          "min-w-0 max-w-none font-bold",
          premium &&
            "rounded-2xl border border-brand-800/15 bg-brand-300 py-3 font-black text-slate-900 shadow-lg shadow-brand-500/20 hover:bg-brand-400/90",
        )}
        onClick={onCheckout}
      >
        الانتقال للدفع
      </Button>
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
