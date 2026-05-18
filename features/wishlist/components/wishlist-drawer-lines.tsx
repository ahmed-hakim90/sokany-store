"use client";

import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { PriceText } from "@/components/ui/price-text";
import { IconButton } from "@/components/ui/icon-button";
import { ROUTES } from "@/lib/constants";
import type { WishlistItem } from "@/features/wishlist/types";
export type WishlistLinesVariant = "default" | "premium";

export function WishlistDrawerLines({
  items,
  onRemove,
  variant = "default",
}: {
  items: WishlistItem[];
  onRemove: (productId: number) => void;
  variant?: WishlistLinesVariant;
}) {
  const premium = variant === "premium";
  return (
    <ul className="w-full min-w-0 space-y-3 pb-3" role="list">
      {items.map((item) => (
        <WishlistDrawerLine
          key={item.productId}
          item={item}
          premium={premium}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}

function WishlistDrawerLine({
  item,
  premium,
  onRemove,
}: {
  item: WishlistItem;
  premium: boolean;
  onRemove: (productId: number) => void;
}) {
  if (premium) {
    return (
      <li className="flex gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.2)] ring-1 ring-slate-900/[0.04] backdrop-blur-sm">
        <Link
          href={ROUTES.PRODUCT(item.productId)}
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200/80 bg-image-well"
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
              className="line-clamp-2 min-w-0 text-start text-sm font-semibold text-slate-900 hover:text-brand-600"
            >
              {item.name}
            </Link>
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-slate-400 hover:bg-slate-100 hover:text-red-600"
              aria-label={`إزالة ${item.name} من المفضلة`}
              onClick={() => onRemove(item.productId)}
            >
              <TrashIcon />
            </IconButton>
          </div>
          <PriceText
            amount={item.price}
            compact
            className="text-sm font-semibold text-slate-600"
            amountClassName="text-sm font-semibold text-slate-600"
          />
        </div>
      </li>
    );
  }

  return (
    <li className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_6.75rem] gap-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/[0.03] sm:grid-cols-[auto_minmax(0,1fr)_7.5rem] sm:gap-4">
      <div className="flex shrink-0 flex-col items-center justify-between gap-2">
        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 w-9 rounded-full bg-white text-red-500 shadow-sm ring-1 ring-slate-900/[0.06] hover:bg-red-50 hover:text-red-600"
          aria-label={`إزالة ${item.name} من المفضلة`}
          onClick={() => onRemove(item.productId)}
        >
          <TrashIcon />
        </IconButton>
        <Link
          href={ROUTES.PRODUCT(item.productId)}
          aria-label={`فتح ${item.name}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-950 shadow-sm ring-1 ring-slate-900/[0.06] transition-colors hover:bg-surface-muted"
        >
          <HeartIcon />
        </Link>
        <FixedQuantityPreview />
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-2 overflow-hidden py-1">
        <Link
          href={ROUTES.PRODUCT(item.productId)}
          className="line-clamp-3 min-w-0 break-words text-start text-sm font-bold leading-6 text-slate-950 [overflow-wrap:anywhere] hover:text-brand-700"
        >
          {item.name}
        </Link>
        <PriceText
          amount={item.price}
          compact
          className="max-w-full min-w-0 flex-wrap text-base font-black text-brand-950"
          amountClassName="text-base font-black text-brand-950"
        />
      </div>
      <Link
        href={ROUTES.PRODUCT(item.productId)}
        className="relative min-h-24 overflow-hidden rounded-xl border border-slate-200 bg-image-well shadow-sm"
      >
        <AppImage
          src={item.thumbnail}
          alt=""
          fill
          sizes="(max-width: 640px) 28vw, 120px"
          className="object-cover"
        />
      </Link>
    </li>
  );
}

function FixedQuantityPreview() {
  return (
    <div
      role="img"
      className="grid grid-cols-3 items-center gap-1 text-center"
      aria-label="المنتج محفوظ كقطعة واحدة في المفضلة"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-base font-black text-slate-900">
        +
      </span>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-950 ring-1 ring-slate-900/[0.06]">
        1
      </span>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-base font-black text-slate-900">
        -
      </span>
    </div>
  );
}

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

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path
        d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
