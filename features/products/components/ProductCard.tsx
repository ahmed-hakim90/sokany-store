"use client";

import Link from "next/link";
import { AppImage } from "@/components/AppImage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  onAddToCart?: (product: Product) => void;
  /** Renders over the image corner (e.g. wishlist IconButton). */
  wishlistSlot?: React.ReactNode;
  className?: string;
};

/** Prefer list vs current price; fall back to regular vs sale_price from WooCommerce. */
function saleDiscountLabel(product: Product): string | null {
  if (!product.onSale) return null;
  const current = product.price;

  const pctFromList = (list: number): number | null => {
    if (!(list > current) || !(list > 0)) return null;
    const pct = Math.round((1 - current / list) * 100);
    if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) return null;
    return pct;
  };

  const a = pctFromList(product.regularPrice);
  if (a !== null) return `خصم ${a}%`;

  if (
    product.salePrice !== null &&
    product.regularPrice > product.salePrice
  ) {
    const pct = Math.round(
      (1 - product.salePrice / product.regularPrice) * 100,
    );
    if (Number.isFinite(pct) && pct > 0 && pct < 100) return `خصم ${pct}%`;
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
  onAddToCart,
  wishlistSlot,
  className,
}: ProductCardProps) {
  const prefetchProduct = usePrefetchProduct();
  const layout = variantLayout[variant];
  const tag =
    product.categories[0]?.name ??
    (product.sku ? `SKU ${product.sku}` : null);
  const compareAt =
    product.onSale && product.regularPrice > product.price
      ? product.regularPrice
      : null;
  const priceCompact = variant === "mobileCompact";
  const wideCta = variant === "desktopCatalogWide";
  const saleLabel = saleDiscountLabel(product);
  const handlePrefetch = () => {
    void prefetchProduct(product.id);
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
        className="relative block aspect-square w-full overflow-hidden bg-image-well p-1 sm:p-1.5"
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
        {wishlistSlot ? (
          <div className="absolute start-2 top-2 z-[2]">{wishlistSlot}</div>
        ) : null}
      </Link>
      <div className={cn("flex flex-1 flex-col", layout.body)}>
        {tag ? <span className={layout.tag}>{tag}</span> : null}
        {product.onSale && saleLabel ? (
          <span className="text-[10px] font-medium text-muted-foreground sm:text-[11px]">
            {saleLabel}
          </span>
        ) : null}
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
            wideCta
              ? "flex flex-col gap-2 pt-2"
              : cn(
                  "flex items-end justify-between gap-2",
                  variant === "mobileCompact" ? "pt-1.5" : "pt-2",
                ),
          )}
        >
          <div
            className={cn(
              "flex min-w-0 items-end justify-between gap-2",
              wideCta ? "w-full" : "flex-1",
            )}
          >
            <PriceText
              amount={product.price}
              compareAt={compareAt}
              compact={priceCompact}
              emphasized={variant === "featured"}
              amountClassName="font-bold text-foreground"
              className="min-w-0 flex-1"
            />
            {onAddToCart && !wideCta ? (
              <IconButton
                type="button"
                variant="subtle"
                size="sm"
                aria-label="أضف للسلة"
                disabled={!product.inStock}
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product);
                }}
                className={cn(
                  "h-10 w-10 shrink-0 rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-900 shadow-none hover:bg-zinc-200/90 md:h-10 md:w-10 md:border-brand-950 md:bg-brand-950 md:text-white md:hover:bg-brand-900",
                  "[&_svg]:h-[18px] [&_svg]:w-[18px] md:[&_svg]:h-5 md:[&_svg]:w-5",
                )}
              >
                <span className="md:hidden text-lg font-bold leading-none" aria-hidden>
                  +
                </span>
                <span className="hidden md:inline" aria-hidden>
                  <CartGlyph />
                </span>
              </IconButton>
            ) : null}
            {onAddToCart && wideCta ? (
              <IconButton
                type="button"
                variant="subtle"
                size="sm"
                aria-label="أضف للسلة"
                disabled={!product.inStock}
                onClick={(e) => {
                  e.preventDefault();
                  onAddToCart(product);
                }}
                className="h-10 w-10 shrink-0 rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-900 shadow-none hover:bg-zinc-200/90 md:hidden"
              >
                <span className="text-lg font-bold leading-none" aria-hidden>
                  +
                </span>
              </IconButton>
            ) : null}
          </div>
          {onAddToCart && wideCta ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={!product.inStock}
              className="hidden w-full rounded-xl font-bold md:inline-flex"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product);
              }}
            >
              <CartGlyph />
              أضف للسلة
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function CartGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.25" />
      <circle cx="18" cy="20" r="1.25" />
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
