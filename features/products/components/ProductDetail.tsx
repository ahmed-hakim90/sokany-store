"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductDetailInfoColumn } from "@/features/products/components/product-detail-info-column";
import { ProductDetailStickyCart } from "@/features/products/components/product-detail-sticky-cart";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import type { ProductTrustSummary } from "@/components/pages/ProductDetailPageContent";
import type { ProductSpecItem } from "@/features/products/components/ProductSpecsList";
import { getProductGalleryBadge } from "@/features/products/lib/product-gallery-badge";
import type { Product } from "@/features/products/types";
import { playCartFlyAnimation } from "@/lib/cart-fly-animation";
import { cn } from "@/lib/utils";

export function ProductDetail({
  product,
  onAddToCart,
  onBuyNow,
  specs,
  canInteractCart = true,
  trustSummary,
}: {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow?: (product: Product, quantity: number) => void;
  specs?: ProductSpecItem[];
  canInteractCart?: boolean;
  trustSummary?: ProductTrustSummary;
}) {
  const [quantity, setQuantity] = useState(1);
  const [flyImageSrc, setFlyImageSrc] = useState(
    () => product.images[0]?.src ?? product.thumbnail,
  );
  const galleryRef = useRef<HTMLDivElement>(null);
  const purchaseRef = useRef<HTMLDivElement>(null);
  const [stickyCartVisible, setStickyCartVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const badge = getProductGalleryBadge(product);

  useEffect(() => {
    const el = purchaseRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const scrolledPast =
          !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setStickyCartVisible(scrolledPast);
      },
      { threshold: 0, rootMargin: "0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [product.id]);

  const handleAddToCart = useCallback(() => {
    onAddToCart(product, quantity);
    void playCartFlyAnimation({
      fromElement: galleryRef.current,
      imageSrc: flyImageSrc,
      prefersReducedMotion: Boolean(reduceMotion),
    });
  }, [flyImageSrc, onAddToCart, product, quantity, reduceMotion]);

  return (
    <div
      className={cn(
        "min-w-0 space-y-12 lg:space-y-14",
        stickyCartVisible && product.inStock && "pb-20 md:pb-24",
      )}
    >
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
          ref={purchaseRef}
          product={product}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
          onBuyNow={
            onBuyNow && product.inStock ? () => onBuyNow(product, quantity) : undefined
          }
          specs={specs ?? []}
          canInteractCart={canInteractCart}
          trustSummary={trustSummary}
        />
      </div>

      <ProductDetailStickyCart
        product={product}
        imageSrc={flyImageSrc}
        visible={stickyCartVisible}
        onAddToCart={handleAddToCart}
        canInteractCart={canInteractCart}
      />
    </div>
  );
}
