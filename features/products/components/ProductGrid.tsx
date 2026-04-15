"use client";

import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import type { Product } from "@/features/products/types";
import {
  ProductCard,
  type ProductCardVariant,
} from "@/features/products/components/ProductCard";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";
import { cn } from "@/lib/utils";

export type ProductGridStatus = "loading" | "empty" | "ready";

const defaultGridClass =
  "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

function subscribeMinMd(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMinMdSnapshot() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
}

function getMinMdServerSnapshot() {
  return false;
}

function useMinMd() {
  return useSyncExternalStore(subscribeMinMd, getMinMdSnapshot, getMinMdServerSnapshot);
}

export type ProductGridProps = {
  className?: string;
  /** Replaces default grid column / gap utilities. */
  gridClassName?: string;
  /** When set, overrides inferred behavior from `products` / slots. */
  status?: ProductGridStatus;
  loading?: ReactNode;
  empty?: ReactNode;
  products?: Product[];
  onAddToCart?: (product: Product) => void;
  renderItem?: (product: Product) => ReactNode;
  cardVariant?: ProductCardVariant;
  /** From `md` breakpoint up, use this variant when set (home bestsellers: compact mobile, catalog desktop). */
  cardVariantMd?: ProductCardVariant;
};

export function ProductGrid({
  products = [],
  onAddToCart,
  className,
  gridClassName,
  status: statusProp,
  loading,
  empty,
  renderItem,
  cardVariant = "desktopCatalog",
  cardVariantMd,
}: ProductGridProps) {
  const status: ProductGridStatus = statusProp ?? "ready";
  const gridClass = gridClassName ?? defaultGridClass;
  const mdUp = useMinMd();
  const resolvedVariant =
    cardVariantMd !== undefined ? (mdUp ? cardVariantMd : cardVariant) : cardVariant;

  if (status === "loading") {
    return (
      <div className={cn(gridClass, className)}>
        {loading ?? (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </>
        )}
      </div>
    );
  }

  if (status === "empty") {
    return <div className={className}>{empty ?? null}</div>;
  }

  return (
    <div className={cn(gridClass, className)}>
      {products.map((product) =>
        renderItem ? (
          <div key={product.id}>{renderItem(product)}</div>
        ) : (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            variant={resolvedVariant}
          />
        ),
      )}
    </div>
  );
}
