"use client";

/**
 * كتلة PDP (معرض + معلومات + شريط لاصق)
 * بالعامية: يظبط الكمية، يشغّل أنيميشن الطيران للسلة لو الحركة مسموحة، ويعرض `ProductDetailStickyCart` لما منطقة الشراء تطلع من الشاشة.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductDetailInfoColumn } from "@/features/products/components/product-detail-info-column";
import { ProductDetailStickyCart } from "@/features/products/components/product-detail-sticky-cart";
import { Product3DButton } from "@/features/products/components/Product3DButton";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { ProductTrustSummary } from "@/components/pages/ProductDetailPageContent";
import type { ProductSpecItem } from "@/features/products/components/ProductSpecsList";
import { getProductGalleryBadge } from "@/features/products/lib/product-gallery-badge";
import { useProduct3DModel } from "@/features/products/hooks/useProduct3DModel";
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
  const reduceMotion = usePrefersReducedMotion();
  const badge = getProductGalleryBadge(product);
  const product3DModelQuery = useProduct3DModel(product.sku);
  const product3DModel = product3DModelQuery.data ?? null;
  const product3DPosterSrc = product.images[0]?.src ?? product.thumbnail;

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
          floatingAction={
            product3DModel?.src ? (
              <Product3DButton
                modelSrc={product3DModel.src}
                productName={product.name}
                posterSrc={product3DPosterSrc}
                className="h-14 w-full justify-start rounded-2xl border-slate-200 bg-white px-3 text-sm shadow-[0_14px_34px_-24px_rgba(15,23,42,0.65)] ring-1 ring-slate-100 hover:bg-slate-50 sm:text-base"
              />
            ) : null
          }
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
