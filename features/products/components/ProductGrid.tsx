"use client";

import type { ReactNode } from "react";
import type { Product } from "@/features/products/types";
import { ProductWishlistHeart } from "@/features/wishlist/components/ProductWishlistHeart";
import { useMinMd } from "@/hooks/useMinMd";
import {
  ProductCard,
  type ProductCardVariant,
} from "@/features/products/components/ProductCard";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";
import { cn } from "@/lib/utils";

export type ProductGridStatus = "loading" | "empty" | "ready";

const defaultGridClass =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5";

export type ProductGridProps = {
  className?: string;
  /** Replaces default grid column / gap utilities. */
  gridClassName?: string;
  /** When set, overrides inferred behavior from `products` / slots. */
  status?: ProductGridStatus;
  /** Placeholder cell count when `status === "loading"` — align with `per_page` to limit layout shift. @default 8 */
  skeletonCount?: number;
  /** First N cards request eager LCP-style image loading (`next/image` priority). @default 5 */
  priorityImageSlots?: number;
  /** Homepage/light grids: short CSS image crossfade only. @default false */
  simpleImageMode?: boolean;
  /** Catalog crossfade length when `simpleImageMode` is false. @default true */
  imageMotion?: boolean;
  loading?: ReactNode;
  empty?: ReactNode;
  products?: Product[];
  getCartLineQuantity?: (productId: number) => number;
  onCartLineQuantityChange?: (product: Product, next: number) => void;
  renderItem?: (product: Product) => ReactNode;
  cardVariant?: ProductCardVariant;
  /** From `md` breakpoint up, use this variant when set (e.g. compact mobile + full catalog on desktop). */
  cardVariantMd?: ProductCardVariant;
  /** First grid cell (e.g. promo tile) before product cards. */
  leadingSlot?: ReactNode;
};

export function ProductGrid({
  products = [],
  getCartLineQuantity,
  onCartLineQuantityChange,
  className,
  gridClassName,
  status: statusProp,
  skeletonCount = 8,
  priorityImageSlots = 5,
  simpleImageMode = false,
  imageMotion = true,
  loading,
  empty,
  renderItem,
  cardVariant = "desktopCatalog",
  cardVariantMd,
  leadingSlot,
}: ProductGridProps) {
  const status: ProductGridStatus = statusProp ?? "ready";
  const gridClass = gridClassName ?? defaultGridClass;
  const mdUp = useMinMd();
  const resolvedVariant =
    cardVariantMd !== undefined ? (mdUp ? cardVariantMd : cardVariant) : cardVariant;
  const nSkeleton = Math.max(1, skeletonCount);

  if (status === "loading") {
    return (
      <div className={cn("min-w-0", gridClass, className)}>
        {leadingSlot ? <div className="min-w-0">{leadingSlot}</div> : null}
        {loading ?? (
          <>
            {Array.from({ length: nSkeleton }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </>
        )}
      </div>
    );
  }

  if (status === "empty") {
    return <div className={cn("min-w-0", className)}>{empty ?? null}</div>;
  }

  return (
    <div className={cn("min-w-0", gridClass, className)}>
      {leadingSlot ? <div className="min-w-0">{leadingSlot}</div> : null}
      {products.map((product, index) =>
        renderItem ? (
          <div key={product.id} className="min-w-0">
            {renderItem(product)}
          </div>
        ) : (
          <ProductCard
            key={product.id}
            product={product}
            imagePriority={index < priorityImageSlots}
            simpleImageMode={simpleImageMode}
            imageMotion={imageMotion}
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={onCartLineQuantityChange}
            variant={resolvedVariant}
            wishlistSlot={<ProductWishlistHeart product={product} />}
          />
        ),
      )}
    </div>
  );
}
