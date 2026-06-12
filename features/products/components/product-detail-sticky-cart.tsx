"use client";

import { Button } from "@/components/Button";
import { AppImage } from "@/components/AppImage";
import { PriceText } from "@/components/ui/price-text";
import type { Product } from "@/features/products/types";
import { cn } from "@/lib/utils";

export function ProductDetailStickyCart({
  product,
  imageSrc,
  visible,
  onAddToCart,
  addToCartLoading = false,
  canInteractCart,
  displayPrice,
  displayInStock,
  canAddToCart = true,
}: {
  product: Product;
  imageSrc: string;
  visible: boolean;
  onAddToCart: () => void;
  addToCartLoading?: boolean;
  canInteractCart: boolean;
  displayPrice?: number;
  displayInStock?: boolean;
  canAddToCart?: boolean;
}) {
  const inStock = displayInStock ?? product.inStock;
  const show = visible && inStock;
  const price = displayPrice ?? product.price;
  if (!show) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[55] max-lg:bottom-mobile-commerce lg:hidden"
      role="region"
      aria-label="إضافة سريعة للسلة"
    >
      <div
        className={cn(
          "surface-glass pointer-events-auto mx-auto flex max-w-7xl items-center gap-3 border border-border/80 px-3 py-2.5 supports-[backdrop-filter]:bg-background/80 md:rounded-2xl md:border md:py-3 md:shadow-lg",
          "pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2.5 md:pb-3",
        )}
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-image-well">
          <AppImage
            src={imageSrc}
            alt={product.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
            {product.name}
          </p>
          <PriceText
            amount={price}
            compareAt={
              product.onSale && product.salePrice !== null && price < product.regularPrice
                ? product.regularPrice
                : null
            }
            className="mt-0.5 text-sm text-brand-900"
          />
        </div>
        <Button
          type="button"
          size="lg"
          className="h-8 shrink-0 gap-0 border-0 bg-gradient-to-b from-brand-400 to-brand-500 px-3 text-base font-bold text-black shadow-md hover:from-brand-300 hover:to-brand-400 sm:px-2"
          disabled={!canInteractCart || !canAddToCart}
          loading={addToCartLoading}
          onClick={onAddToCart}
        >
          {addToCartLoading ? "جاري الإضافة…" : "أضف للسلة"}
        </Button>
      </div>
    </div>
  );
}
