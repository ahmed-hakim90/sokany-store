"use client";

import { memo } from "react";
import Link from "next/link";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { PriceText } from "@/components/ui/price-text";
import { QtyControl } from "@/components/ui/qty-control";
import { IconButton } from "@/components/ui/icon-button";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/features/cart/types";

export function CartDrawerLines({
  items,
  onQuantityChange,
  onRemove,
  listClassName,
}: {
  items: CartItem[];
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  listClassName?: string;
}) {
  return (
    <ul className={listClassName ?? "space-y-2.5 pb-3"} role="list">
      {items.map((item) => (
        <CartSheetLine
          key={item.productId}
          item={item}
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
}: {
  onCheckout: () => void;
  /** When true, show a text link to the full cart page under the primary CTA. */
  showFullCartLink?: boolean;
}) {
  return (
    <div className="shrink-0 border-t border-border bg-white px-4 pt-3 shadow-[0_-4px_20px_-6px_rgba(15,23,42,0.08)]">
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full font-bold"
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
}: {
  item: CartItem;
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}) {
  return (
    <li className="flex gap-3 rounded-xl border border-border/80 bg-white p-3 shadow-sm">
      <Link
        href={ROUTES.PRODUCT(item.productId)}
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-image-well"
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
            className="line-clamp-2 text-start text-sm font-semibold text-foreground hover:text-brand-600"
          >
            {item.name}
          </Link>
          <IconButton
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground hover:text-red-600"
            aria-label={`إزالة ${item.name}`}
            onClick={() => onRemove(item.productId)}
          >
            <TrashIcon />
          </IconButton>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-brand-900" dir="ltr">
            {formatPrice(item.price)}
          </span>
          <QtyControl
            value={item.quantity}
            min={1}
            max={999}
            onChange={(q) => onQuantityChange(item.productId, q)}
          />
        </div>
        <div className="flex justify-end">
          <PriceText
            amount={item.price * item.quantity}
            compact
            className="text-xs text-muted-foreground"
          />
        </div>
      </div>
    </li>
  );
});

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
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
