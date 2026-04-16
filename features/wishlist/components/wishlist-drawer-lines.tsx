"use client";

import Link from "next/link";
import { AppImage } from "@/components/AppImage";
import { PriceText } from "@/components/ui/price-text";
import { IconButton } from "@/components/ui/icon-button";
import { ROUTES } from "@/lib/constants";
import type { WishlistItem } from "@/features/wishlist/types";

export function WishlistDrawerLines({
  items,
  onRemove,
}: {
  items: WishlistItem[];
  onRemove: (productId: number) => void;
}) {
  return (
    <ul className="space-y-2.5 pb-3" role="list">
      {items.map((item) => (
        <li
          key={item.productId}
          className="flex gap-3 rounded-xl border border-border/80 bg-white p-3 shadow-sm"
        >
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
                aria-label={`إزالة ${item.name} من المفضلة`}
                onClick={() => onRemove(item.productId)}
              >
                <TrashIcon />
              </IconButton>
            </div>
            <PriceText
              amount={item.price}
              compact
              className="text-sm font-semibold text-brand-900"
            />
          </div>
        </li>
      ))}
    </ul>
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
