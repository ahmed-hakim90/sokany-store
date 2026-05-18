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
import { VirtualizedProductGrid } from "@/features/products/components/VirtualizedProductGrid";
import type { GridColumnCounts } from "@/hooks/useGridColumns";
import { VIRTUAL_PRODUCT_THRESHOLD } from "@/lib/constants";
import {
  defaultProductGridClassName,
  productGridCellClassName,
} from "@/features/products/lib/product-card-layout";
import { cn } from "@/lib/utils";

export type ProductGridStatus = "loading" | "empty" | "ready";

const defaultGridClass = defaultProductGridClassName;

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
  /** Dense sections can disable swipe/pointer image switching. @default true */
  imageInteractions?: boolean;
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
  /**
   * شبكة افتراضية للقوائم الطويلة — يقلل DOM على الموبايل.
   * ‎`auto`‎: يفعّل عند ‎`products.length >= VIRTUAL_PRODUCT_THRESHOLD`‎.
   * لا يُدعم مع ‎`leadingSlot`‎ (يُرجَع للشبكة الثابتة).
   */
  virtualize?: boolean | "auto";
  /** أعمدة الشبكة الافتراضية فقط — يُستخدم مع ‎`virtualize`‎ عندما تختلف عن كتالوج ‎`/products`‎. */
  virtualGridColumnCounts?: GridColumnCounts;
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
  imageInteractions = true,
  loading,
  empty,
  renderItem,
  cardVariant = "desktopCatalog",
  cardVariantMd,
  leadingSlot,
  virtualize = false,
  virtualGridColumnCounts,
}: ProductGridProps) {
  const status: ProductGridStatus = statusProp ?? "ready";
  const gridClass = gridClassName ?? defaultGridClass;
  const mdUp = useMinMd();
  const resolvedVariant =
    cardVariantMd !== undefined ? (mdUp ? cardVariantMd : cardVariant) : cardVariant;
  const nSkeleton = Math.max(1, skeletonCount);

  const useVirtualization =
    !leadingSlot &&
    (virtualize === true ||
      (virtualize === "auto" && products.length >= VIRTUAL_PRODUCT_THRESHOLD));

  if (status === "loading") {
    return (
      <div className={cn("min-w-0", gridClass, className)}>
        {leadingSlot ? <div className="min-w-0">{leadingSlot}</div> : null}
        {loading ?? (
          <>
            {Array.from({ length: nSkeleton }).map((_, i) => (
              <div key={i} className={productGridCellClassName}>
                <ProductSkeleton />
              </div>
            ))}
          </>
        )}
      </div>
    );
  }

  if (status === "empty") {
    return <div className={cn("min-w-0", className)}>{empty ?? null}</div>;
  }

  if (useVirtualization) {
    return (
      <VirtualizedProductGrid
        className={className}
        virtualColumnCounts={virtualGridColumnCounts}
        products={products}
        priorityImageSlots={priorityImageSlots}
        simpleImageMode={simpleImageMode}
        imageMotion={imageMotion}
        imageInteractions={imageInteractions}
        getCartLineQuantity={getCartLineQuantity}
        onCartLineQuantityChange={onCartLineQuantityChange}
        renderItem={renderItem}
        cardVariant={cardVariant}
        cardVariantMd={cardVariantMd}
      />
    );
  }

  return (
    <div className={cn("min-w-0", gridClass, className)}>
      {leadingSlot ? <div className="min-w-0 lg:col-span-full">{leadingSlot}</div> : null}
      {products.map((product, index) =>
        renderItem ? (
          <div key={product.id} className={productGridCellClassName}>
            {renderItem(product)}
          </div>
        ) : (
          <div key={product.id} className={productGridCellClassName}>
            <ProductCard
              product={product}
              imagePriority={index < priorityImageSlots}
              simpleImageMode={simpleImageMode}
              imageMotion={imageMotion}
              imageInteractions={imageInteractions}
              getCartLineQuantity={getCartLineQuantity}
              onCartLineQuantityChange={onCartLineQuantityChange}
              variant={resolvedVariant}
              wishlistSlot={<ProductWishlistHeart product={product} />}
            />
          </div>
        ),
      )}
    </div>
  );
}
