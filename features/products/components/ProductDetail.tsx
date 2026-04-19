"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { ProductDetailInfoColumn } from "@/features/products/components/product-detail-info-column";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import type { ProductSpecItem } from "@/features/products/components/ProductSpecsList";
import { getProductGalleryBadge } from "@/features/products/lib/product-gallery-badge";
import type { Product } from "@/features/products/types";
import { playCartFlyAnimation } from "@/lib/cart-fly-animation";

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
  const [flyImageSrc, setFlyImageSrc] = useState(
    () => product.images[0]?.src ?? product.thumbnail,
  );
  const galleryRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const badge = getProductGalleryBadge(product);

  const handleAddToCart = useCallback(() => {
    onAddToCart(product, quantity);
    void playCartFlyAnimation({
      fromElement: galleryRef.current,
      imageSrc: flyImageSrc,
      prefersReducedMotion: Boolean(reduceMotion),
    });
  }, [flyImageSrc, onAddToCart, product, quantity, reduceMotion]);

  return (
    <div className="min-w-0 space-y-12 lg:space-y-14">
      <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-10">
        <ProductGallery
          ref={galleryRef}
          images={product.images}
          productName={product.name}
          fallbackSrc={product.thumbnail}
          priority
          galleryBadge={badge}
          onActiveImageChange={setFlyImageSrc}
        />
        <ProductDetailInfoColumn
          product={product}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
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
