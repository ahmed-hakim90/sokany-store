"use client";

import { useState } from "react";
import type { Product } from "@/features/products/types";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { ProductInfoPanel } from "@/features/products/components/ProductInfoPanel";
import {
  ProductSpecsList,
  type ProductSpecItem,
} from "@/features/products/components/ProductSpecsList";

export function ProductDetail({
  product,
  onAddToCart,
  specs,
}: {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  specs?: ProductSpecItem[];
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="min-w-0 space-y-10 lg:space-y-14">
      <div className="grid min-w-0 gap-10 lg:grid-cols-2">
        <ProductGallery
          images={product.images}
          productName={product.name}
          fallbackSrc={product.thumbnail}
          priority
        />
        <div className="min-w-0">
          <ProductInfoPanel
            product={product}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={() => onAddToCart(product, quantity)}
          />
        </div>
      </div>
      {specs && specs.length > 0 ? (
        <ProductSpecsList items={specs} className="border-t-0 pt-0" />
      ) : null}
    </div>
  );
}
