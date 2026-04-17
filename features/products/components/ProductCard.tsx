"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppImage } from "@/components/AppImage";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { PriceText } from "@/components/ui/price-text";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { usePrefetchProduct } from "@/features/products/hooks/usePrefetchProduct";
import type { Product } from "@/features/products/types";

export type ProductCardVariant =
  | "mobileCompact"
  | "desktopCatalog"
  | "desktopCatalogWide"
  | "featured";

export type ProductCardProps = {
  product: Product;
  variant?: ProductCardVariant;
  getCartLineQuantity?: (productId: number) => number;
  onCartLineQuantityChange?: (product: Product, next: number) => void;
  /** Renders over the image corner (e.g. wishlist IconButton). */
  wishlistSlot?: React.ReactNode;
  className?: string;
};

/** Prefer list vs current price; fall back to regular vs sale_price from WooCommerce. */
function saleDiscountPercent(product: Product): number | null {
  if (!product.onSale) return null;
  const current = product.price;

  const pctFromList = (list: number): number | null => {
    if (!(list > current) || !(list > 0)) return null;
    const pct = Math.round((1 - current / list) * 100);
    if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) return null;
    return pct;
  };

  const a = pctFromList(product.regularPrice);
  if (a !== null) return a;

  if (
    product.salePrice !== null &&
    product.regularPrice > product.salePrice
  ) {
    const pct = Math.round(
      (1 - product.salePrice / product.regularPrice) * 100,
    );
    if (Number.isFinite(pct) && pct > 0 && pct < 100) return pct;
  }

  return null;
}

const variantLayout: Record<
  ProductCardVariant,
  { card: string; body: string; title: string; tag: string }
> = {
  mobileCompact: {
    card: "overflow-hidden p-0",
    body: "gap-1 p-2.5 sm:p-3",
    title: "line-clamp-2 text-xs font-bold leading-snug",
    tag: "text-[10px] font-medium text-muted-foreground",
  },
  desktopCatalog: {
    card: "overflow-hidden p-0",
    body: "gap-1 p-3 sm:gap-1.5 sm:p-4",
    title: "line-clamp-2 text-sm font-bold leading-snug",
    tag: "text-[11px] font-medium text-muted-foreground",
  },
  desktopCatalogWide: {
    card: "overflow-hidden p-0",
    body: "gap-1 p-3 sm:gap-1.5 sm:p-4",
    title: "line-clamp-2 text-sm font-bold leading-snug",
    tag: "text-[11px] font-medium text-muted-foreground",
  },
  featured: {
    card: "overflow-hidden p-0",
    body: "gap-1.5 p-3 sm:gap-2 sm:p-5",
    title: "line-clamp-2 text-sm font-bold leading-snug sm:text-base",
    tag: "text-[11px] font-medium text-muted-foreground sm:text-xs",
  },
};

export function ProductCard({
  product,
  variant = "desktopCatalog",
  getCartLineQuantity,
  onCartLineQuantityChange,
  wishlistSlot,
  className,
}: ProductCardProps) {
  const prefetchProduct = usePrefetchProduct();
  const addFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const layout = variantLayout[variant];
  const tag =
    product.categories[0]?.name ??
    (product.sku ? `SKU ${product.sku}` : null);
  const compareAt =
    product.onSale && product.regularPrice > product.price
      ? product.regularPrice
      : null;
  const priceCompact = variant === "mobileCompact";
  const saleDiscount = saleDiscountPercent(product);
  const handlePrefetch = () => {
    void prefetchProduct(product.id);
  };
  const lineQty = getCartLineQuantity?.(product.id) ?? 0;
  const showCartQty = Boolean(onCartLineQuantityChange);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    return () => {
      if (addFeedbackTimerRef.current) {
        clearTimeout(addFeedbackTimerRef.current);
      }
    };
  }, []);

  const handleAddToCart = () => {
    if (!onCartLineQuantityChange || !product.inStock) return;
    onCartLineQuantityChange(product, Math.min(99, lineQty + 1));
    setJustAdded(true);
    if (addFeedbackTimerRef.current) {
      clearTimeout(addFeedbackTimerRef.current);
    }
    addFeedbackTimerRef.current = setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  return (
    <Card
      variant="product"
      className={cn(
        "flex h-full min-w-0 flex-col transition-transform duration-200 hover:scale-[1.02] hover:shadow-md motion-reduce:hover:scale-100",
        layout.card,
        className,
      )}
    >
      <Link
        href={ROUTES.PRODUCT(product.id)}
        className="relative block aspect-square low-hidden bg-image-well p-1 sm:p-1.5"
        onMouseEnter={handlePrefetch}
        onFocus={handlePrefetch}
      >
        <AppImage
          src={product.thumbnail}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover object-center"
        />
        {saleDiscount !== null ? (
          <span className="absolute start-2 top-2 z-[2] rounded-[4] bg-[#101923] px-3 py-1.5 text-sm font-extrabold leading-none tracking-wide text-[#d8ff35] shadow-sm sm:px-3.5 sm:py-2 text-sm">
            %{saleDiscount} خصم
          </span>
        ) : null}
        {wishlistSlot ? (
          <div className="absolute end-2 top-2 z-[2]">{wishlistSlot}</div>
        ) : null}
      </Link>
      <div className={cn("flex flex-1 flex-col", layout.body)}>
        {tag ? <span className={layout.tag}>{tag}</span> : null}
        {!product.inStock ? (
          <span className="text-[10px] font-semibold text-muted-foreground sm:text-[11px]">
            غير متوفر حالياً
          </span>
        ) : null}
        <Link
          href={ROUTES.PRODUCT(product.id)}
          className={cn("text-foreground hover:text-brand-800", layout.title)}
          onMouseEnter={handlePrefetch}
          onFocus={handlePrefetch}
        >
          {product.name}
        </Link>
        <div
          className={cn(
            "mt-auto",
            showCartQty
              ? cn(
                  "flex flex-col gap-2",
                  variant === "mobileCompact" ? "pt-1.5" : "pt-2",
                )
              : cn(
                  "flex items-end justify-between gap-2",
                  variant === "mobileCompact" ? "pt-1.5" : "pt-2",
                ),
          )}
        >
          {showCartQty ? (
            <>
              <PriceText
                presentation="tile"
                amount={product.price}
                compareAt={compareAt}
                compact={priceCompact}
                emphasized={variant === "featured"}
                className="min-w-0 max-w-none"
              />
              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleAddToCart}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs/tight font-extrabold transition-colors",
                  product.inStock
                    ? "bg-[#d8ff35] text-[#101923] hover:bg-[#cbf22f]"
                    : "cursor-not-allowed bg-muted text-muted-foreground",
                )}
              >
                <CartIcon />
                <span>{justAdded ? "تمت الإضافة" : "أضف للسلة"}</span>
              </button>
            </>
          ) : (
            <div className="min-w-0 flex-1">
              <PriceText
                presentation="tile"
                amount={product.price}
                compareAt={compareAt}
                compact={priceCompact}
                emphasized={variant === "featured"}
                className="min-w-0 max-w-none"
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M3 4h2.2c.5 0 .93.33 1.06.81l.54 2.02m0 0L8 12h9.5a1 1 0 00.97-.76l1.2-4.8a.75.75 0 00-.73-.94H6.8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="18.2" r="1.3" fill="currentColor" />
      <circle cx="17" cy="18.2" r="1.3" fill="currentColor" />
    </svg>
  );
}

/** Optional heart icon for wishlistSlot on ProductCard. */
export function ProductCardWishlistIconButton({
  pressed,
  onPress,
  labels = { add: "Add to favorites", remove: "Remove from favorites" },
}: {
  pressed?: boolean;
  onPress?: () => void;
  labels?: { add: string; remove: string };
}) {
  return (
    <IconButton
      type="button"
      variant="subtle"
      size="sm"
      aria-label={pressed ? labels.remove : labels.add}
      aria-pressed={pressed}
      onClick={(e) => {
        e.preventDefault();
        onPress?.();
      }}
      className="rounded-xl border border-white/60 bg-white/95 shadow-sm backdrop-blur-sm hover:bg-white"
    >
      <HeartIcon filled={pressed} />
    </IconButton>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      {filled ? (
        <path
          fill="currentColor"
          d="M12 21s-7-4.35-9.33-8.15A5.65 5.65 0 0112 5a5.65 5.65 0 019.33 7.85C19 16.65 12 21 12 21z"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          d="M12 21s-7-4.35-9.33-8.15A5.65 5.65 0 0112 5a5.65 5.65 0 019.33 7.85C19 16.65 12 21 12 21z"
        />
      )}
    </svg>
  );
}
