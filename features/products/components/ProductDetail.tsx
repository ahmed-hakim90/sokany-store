"use client";

import { useState } from "react";
import { ProductDetailInfoColumn } from "@/features/products/components/product-detail-info-column";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import type { ProductSpecItem } from "@/features/products/components/ProductSpecsList";
import { getProductGalleryBadge } from "@/features/products/lib/product-gallery-badge";
import type { Product } from "@/features/products/types";

export function ProductDetail({
  product,
  onAddToCart,
  onBuyNow,
  specs,
  canInteractCart = true,
}: {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow?: (product: Product, quantity: number) => void;
  specs?: ProductSpecItem[];
  canInteractCart?: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const badge = getProductGalleryBadge(product);

  return (
    <div className="min-w-0 space-y-12 lg:space-y-14">
      <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-10">
        <ProductGallery
          images={product.images}
          productName={product.name}
          fallbackSrc={product.thumbnail}
          priority
          galleryBadge={badge}
        />
        <ProductDetailInfoColumn
          product={product}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={() => onAddToCart(product, quantity)}
          onBuyNow={
            onBuyNow && product.inStock ? () => onBuyNow(product, quantity) : undefined
          }
          specs={specs ?? []}
          canInteractCart={canInteractCart}
        />
      </div>
    </div>
  );
}
