"use client";

import { Button } from "@/components/Button";
import { PriceText } from "@/components/ui/price-text";
import { QtyControl } from "@/components/ui/qty-control";
import type { Product } from "@/features/products/types";
import { ProductBadge } from "@/features/products/components/ProductBadge";

export type ProductInfoPanelProps = {
  product: Product;
  quantity: number;
  onQuantityChange: (next: number) => void;
  /** Called with current panel quantity (parent should read cart / product as needed). */
  onAddToCart: () => void;
  showQuantity?: boolean;
};

export function ProductInfoPanel({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  showQuantity = true,
}: ProductInfoPanelProps) {
  const compareAt =
    product.onSale && product.salePrice !== null ? product.regularPrice : null;

  return (
    <div className="flex flex-col gap-4 lg:gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {product.onSale ? <ProductBadge variant="sale" /> : null}
        {product.featured ? <ProductBadge variant="featured" /> : null}
        {!product.inStock ? <ProductBadge variant="outOfStock" /> : null}
      </div>
      <div>
        <h1 className="text-pretty font-display text-2xl font-semibold break-words text-foreground sm:text-3xl lg:text-4xl">
          {product.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          SKU:{" "}
          <span className="break-all font-mono text-foreground">{product.sku}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {product.inStock ? (
            <span className="text-emerald-800">In stock</span>
          ) : (
            <span>Out of stock</span>
          )}
        </p>
      </div>
      <div>
        <PriceText
          amount={product.price}
          compareAt={compareAt}
          emphasized
          className="text-brand-900"
        />
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-zinc-700">
        <p className="break-words">{product.shortDescription || product.description}</p>
        {product.description.length > 0 && product.shortDescription ? (
          <p className="break-words text-zinc-600">{product.description}</p>
        ) : null}
      </div>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
        {showQuantity && product.inStock ? (
          <QtyControl
            value={quantity}
            min={1}
            max={99}
            onChange={onQuantityChange}
            disabled={!product.inStock}
          />
        ) : null}
        <Button
          size="lg"
          className="w-full sm:w-auto sm:min-w-[200px]"
          disabled={!product.inStock}
          onClick={onAddToCart}
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
}
