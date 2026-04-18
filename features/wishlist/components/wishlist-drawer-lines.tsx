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
    <ul
      className="w-full min-w-0 space-y-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:space-y-3 sm:pb-3"
      role="list"
    >
      {items.map((item) => (
        <li
          key={item.productId}
          className="flex w-full min-w-0 max-w-full gap-2 overflow-hidden rounded-xl border border-border/80 bg-white p-2 shadow-sm sm:gap-3 sm:p-3"
        >
          <Link
            href={ROUTES.PRODUCT(item.productId)}
            className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-image-well sm:h-16 sm:w-16"
          >
            <AppImage
              src={item.thumbnail}
              alt=""
              fill
              sizes="(max-width: 640px) 15vw, 64px"
              className="object-cover"
            />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden sm:gap-1.5">
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-1.5 sm:gap-2">
              <Link
                href={ROUTES.PRODUCT(item.productId)}
                className="line-clamp-2 min-w-0 break-words text-start text-sm font-semibold leading-snug text-foreground [overflow-wrap:anywhere] hover:text-brand-600 sm:leading-normal"
              >
                {item.name}
              </Link>
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-red-600 sm:h-8 sm:w-8 [&_svg]:h-[1.125rem] [&_svg]:w-[1.125rem] sm:[&_svg]:h-4 sm:[&_svg]:w-4"
                aria-label={`إزالة ${item.name} من المفضلة`}
                onClick={() => onRemove(item.productId)}
              >
                <TrashIcon />
              </IconButton>
            </div>
            <div className="min-w-0 max-w-full">
              <PriceText
                amount={item.price}
                compact
                className="max-w-full min-w-0 flex-wrap text-sm font-semibold text-brand-900"
              />
            </div>
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
