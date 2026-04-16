"use client";

import Link from "next/link";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { PriceText } from "@/components/ui/price-text";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { usePrefetchProduct } from "@/features/products/hooks/usePrefetchProduct";
import type { Product } from "@/features/products/types";
import { ProductBadge } from "@/features/products/components/ProductBadge";

export type ProductCardVariant =
  | "mobileCompact"
  | "desktopCatalog"
  | "featured"
  | "homeBestseller";

export type ProductCardProps = {
  product: Product;
  variant?: ProductCardVariant;
  onAddToCart?: (product: Product) => void;
  /** Renders over the image corner (e.g. wishlist IconButton). */
  wishlistSlot?: React.ReactNode;
  className?: string;
};

const variantLayout: Record<
  ProductCardVariant,
  { card: string; body: string; title: string; image: string }
> = {
  mobileCompact: {
    card: "overflow-hidden p-0",
    body: "gap-1.5 p-2.5",
    title: "line-clamp-2 text-xs font-semibold",
    image: "aspect-square",
  },
  desktopCatalog: {
    card: "overflow-hidden p-0",
    body: "gap-1.5 p-3 sm:gap-2 sm:p-4",
    title: "line-clamp-2 text-sm font-bold",
    image: "aspect-[5/6] sm:aspect-square",
  },
  featured: {
    card: "overflow-hidden p-0 ring-1 ring-brand-500/20",
    body: "gap-1.5 p-3 sm:gap-2 sm:p-5",
    title: "line-clamp-2 text-base font-bold sm:text-lg",
    image: "aspect-[5/6] sm:aspect-square",
  },
  homeBestseller: {
    card: "overflow-hidden rounded-2xl border border-black/[0.05] p-0 shadow-[0_6px_22px_-10px_rgba(15,23,42,0.12)]",
    body: "gap-1.5 p-3 pt-2.5",
    title:
      "line-clamp-2 min-h-[2.75rem] text-[13px] font-semibold leading-snug text-black",
    image: "aspect-[4/5]",
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
    product.onSale && product.salePrice !== null ? product.regularPrice : null;
  const priceCompact = variant === "mobileCompact" || variant === "homeBestseller";
  const isHomeBestseller = variant === "homeBestseller";
  const handlePrefetch = () => {
    void prefetchProduct(product.id);
  };

  return (
    <Card
      variant="product"
      className={cn(
        "flex h-full min-w-0 flex-col transition-transform hover:-translate-y-0.5",
        layout.card,
        className,
      )}
    >
      <Link
        href={ROUTES.PRODUCT(product.id)}
        className={cn(
          "relative block w-full overflow-hidden bg-image-well",
          layout.image,
        )}
        onMouseEnter={handlePrefetch}
        onFocus={handlePrefetch}
      >
        <AppImage
          src={product.thumbnail}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover"
        />
        {wishlistSlot ? (
          <div className="absolute start-2 top-2 z-[2]">{wishlistSlot}</div>
        ) : null}
        <div className="absolute end-2 top-2 z-[1] flex max-w-[48%] flex-col items-end gap-1">
          {product.onSale ? (
            <span className="rounded-md bg-black/25 px-0.5 py-0.5 backdrop-blur-sm">
              <ProductBadge variant="sale" />
            </span>
          ) : null}
          {product.featured ? (
            <span className="rounded-md bg-black/25 px-0.5 py-0.5 backdrop-blur-sm">
              <ProductBadge variant="featured" />
            </span>
          ) : null}
          {!product.inStock ? (
            <span className="rounded-md bg-black/25 px-0.5 py-0.5 backdrop-blur-sm">
              <ProductBadge variant="outOfStock" />
            </span>
          ) : null}
        </div>
      </Link>
      <div className={cn("flex flex-1 flex-col", layout.body)}>
        {tag ? (
          <span
            className={cn(
              "text-[10px] font-medium text-muted-foreground sm:text-xs",
              isHomeBestseller
                ? "normal-case tracking-normal"
                : "uppercase tracking-wide",
            )}
          >
            {tag}
          </span>
        ) : null}
        <Link
          href={ROUTES.PRODUCT(product.id)}
          className={cn(
            isHomeBestseller ? "text-black hover:text-black" : "text-foreground hover:text-brand-700",
            layout.title,
          )}
          onMouseEnter={handlePrefetch}
          onFocus={handlePrefetch}
        >
          {product.name}
        </Link>
        {!isHomeBestseller ? (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground sm:text-xs">
            <span>
              {product.rating.toFixed(1)} ({product.ratingCount})
            </span>
          </div>
        ) : null}
        <div
          className={cn(
            "mt-auto",
            isHomeBestseller
              ? "flex flex-row flex-wrap items-end justify-between gap-2 pt-2"
              : cn(
                  "flex items-end justify-between gap-2",
                  variant === "mobileCompact" ? "pt-1" : "pt-1.5 sm:pt-2",
                ),
          )}
        >
          <PriceText
            amount={product.price}
            compareAt={compareAt}
            compact={priceCompact}
            emphasized={variant === "featured" || isHomeBestseller}
            amountClassName={isHomeBestseller ? "text-base font-bold !text-black" : undefined}
            className={cn("min-w-0", !isHomeBestseller && "flex-1")}
          />
          {onAddToCart ? (
            <Button
              size="sm"
              variant={isHomeBestseller ? "secondary" : "primary"}
              disabled={!product.inStock}
              className={cn(
                variant === "mobileCompact" && "shrink-0 px-2 text-xs",
                isHomeBestseller &&
                  "h-9 min-w-[6.5rem] shrink-0 rounded-lg text-xs font-semibold sm:text-sm",
              )}
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product);
              }}
            >
              {variant === "mobileCompact" ? "+" : "أضف للسلة"}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
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
      className="bg-white/90 shadow-sm backdrop-blur-sm"
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
