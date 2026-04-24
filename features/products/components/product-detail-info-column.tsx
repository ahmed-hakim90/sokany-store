"use client";

import { forwardRef } from "react";
import { Button } from "@/components/Button";
import { PriceText } from "@/components/ui/price-text";
import { QtyControl } from "@/components/ui/qty-control";
import { ProductDetailBreadcrumbs } from "@/features/products/components/product-detail-breadcrumbs";
import { ProductDetailDescriptionBlocks } from "@/features/products/components/product-detail-description-blocks";
import {
  ProductSpecsList,
  type ProductSpecItem,
} from "@/features/products/components/ProductSpecsList";
import { ProductDetailTrustStrip } from "@/features/products/components/product-detail-trust-badges";
import type { Product } from "@/features/products/types";
import { cn } from "@/lib/utils";

function savePercent(product: Product): number | null {
  if (!product.onSale || product.regularPrice <= 0) return null;
  if (product.regularPrice <= product.price) return null;
  return Math.round((1 - product.price / product.regularPrice) * 100);
}

export const ProductDetailInfoColumn = forwardRef<
  HTMLDivElement,
  {
    product: Product;
    quantity: number;
    onQuantityChange: (next: number) => void;
    onAddToCart: () => void;
    onBuyNow?: () => void;
    specs: ProductSpecItem[];
    canInteractCart?: boolean;
    className?: string;
  }
>(function ProductDetailInfoColumn(
  {
    product,
    quantity,
    onQuantityChange,
    onAddToCart,
    onBuyNow,
    specs,
    canInteractCart = true,
    className,
  },
  ref,
) {
  const compareAt =
    product.onSale && product.salePrice !== null ? product.regularPrice : null;
  const pct = savePercent(product);

  return (
    <div className={cn("flex min-w-0 flex-col gap-5 lg:gap-6", className)}>
      <ProductDetailBreadcrumbs product={product} />

      <div className="min-w-0 space-y-2">
        <h1 className="text-pretty font-display text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl">
          {product.name}
        </h1>
        <p className="text-xs text-muted-foreground">
          {product.inStock ? (
            <span className="text-emerald-700">متوفر للطلب</span>
          ) : (
            <span className="font-medium text-foreground">غير متوفر حالياً</span>
          )}
          {product.sku ? (
            <>
              <span className="mx-1.5 text-border">·</span>
              <span>SKU: {product.sku}</span>
            </>
          ) : null}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
        <PriceText
          amount={product.price}
          compareAt={compareAt}
          emphasized
          className="text-brand-900"
        />
        {pct != null && pct > 0 ? (
          <span className="rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-900 ring-1 ring-brand-300/60">
            وفر {pct}%
          </span>
        ) : null}
      </div>

      <div
        ref={ref}
        className="flex flex-col gap-3 border-t border-border/80 pt-5"
      >
        {product.inStock ? (
          <QtyControl
            value={quantity}
            min={1}
            max={99}
            onChange={onQuantityChange}
            disabled={!product.inStock || !canInteractCart}
            layout="segmented"
            className=" max-w-[11rem] self-start"
          />
        ) : null}

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
          <Button
            size="lg"
            className={cn(
              "relative h-12 gap-0 border-0 bg-gradient-to-b from-brand-400 to-brand-500 text-base font-bold text-black shadow-md hover:from-brand-300 hover:to-brand-400 sm:flex-1",
            )}
            disabled={!product.inStock || !canInteractCart}
            onClick={onAddToCart}
            aria-label="أضف إلى السلة"
          >
            <span className="relative z-10 text-center">أضف إلى السلة</span>
            <span
              className="absolute start-3 top-1/2 z-0 -translate-y-1/2 sm:start-4"
              aria-hidden
            >
              <CartIcon className="h-6 w-6" />
            </span>
          </Button>
          {onBuyNow ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="h-12  border-border bg-white text-base font-semibold text-foreground hover:bg-surface-muted sm:w-auto sm:min-w-[9.5rem]"
              disabled={!product.inStock || !canInteractCart}
              onClick={onBuyNow}
            >
              شراء الآن
            </Button>
          ) : null}
        </div>

        <ProductDetailTrustStrip />
      </div>

      <ProductSpecsList
        items={specs}
        title="المواصفات التقنية"
        variant="panel"
        className="border-t border-border/80 pt-5"
      />

      <ProductDetailDescriptionBlocks product={product} className="pt-2" />
    </div>
  );
});

function CartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}
