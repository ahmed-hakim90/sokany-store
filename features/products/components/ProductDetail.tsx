"use client";

/**
 * كتلة PDP (معرض + معلومات + شريط لاصق)
 * بالعامية: يظبط الكمية، يشغّل أنيميشن الطيران للسلة لو الحركة مسموحة، ويعرض `ProductDetailStickyCart` لما منطقة الشراء تطلع من الشاشة.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductDetailInfoColumn } from "@/features/products/components/product-detail-info-column";
import { ProductDetailStickyCart } from "@/features/products/components/product-detail-sticky-cart";
import { Product3DButton } from "@/features/products/components/Product3DButton";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { ProductDetailBreadcrumbs } from "@/features/products/components/product-detail-breadcrumbs";
import { ProductTrustStrip } from "@/features/products/components/product-trust-strip";
import { ProductDetailContentSections } from "@/features/products/components/product-detail-content-sections";
import { ProductVariationPicker } from "@/features/products/components/product-variation-picker";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { ProductTrustSummary } from "@/components/pages/ProductDetailPageContent";
import type { ProductSpecItem } from "@/features/products/components/ProductSpecsList";
import { getProductGalleryBadge } from "@/features/products/lib/product-gallery-badge";
import { getProductBenefitBullets } from "@/features/products/lib/product-merchandising";
import { useProduct3DModel } from "@/features/products/hooks/useProduct3DModel";
import { useProductVariationSelection } from "@/features/products/hooks/useProductVariationSelection";
import type { Product } from "@/features/products/types";
import type { AddProductLineOptions } from "@/hooks/useCart";
import { playCartFlyAnimation } from "@/lib/cart-fly-animation";
import { cn, formatPrice } from "@/lib/utils";

export function ProductDetail({
  product,
  onAddToCart,
  onBuyNow,
  specs,
  canInteractCart = true,
  trustSummary,
}: {
  product: Product;
  onAddToCart: (
    product: Product,
    quantity: number,
    options?: AddProductLineOptions,
  ) => void;
  onBuyNow?: (
    product: Product,
    quantity: number,
    options?: AddProductLineOptions,
  ) => void;
  specs?: ProductSpecItem[];
  canInteractCart?: boolean;
  trustSummary?: ProductTrustSummary;
}) {
  const [quantity, setQuantity] = useState(1);
  const [cartAdding, setCartAdding] = useState(false);
  const variation = useProductVariationSelection(product);
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
  const benefits = getProductBenefitBullets(product, 4);

  const optionsByName = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const attr of product.attributes) {
      if (attr.variation && attr.options.length > 0) {
        map[attr.name] = attr.options;
      }
    }
    return map;
  }, [product.attributes]);

  const priceRangeLabel = useMemo(() => {
    if (!variation.isVariable || !variation.priceRange) return null;
    const { low, high } = variation.priceRange;
    if (low === high) return formatPrice(low);
    return `${formatPrice(low)} – ${formatPrice(high)}`;
  }, [variation.isVariable, variation.priceRange]);

  useEffect(() => {
    setFlyImageSrc(variation.displayThumbnail);
  }, [variation.displayThumbnail]);

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

  const runAddToCart = useCallback(() => {
    if (!variation.canAddToCart) return;
    onAddToCart(product, quantity, variation.buildAddOptions());
  }, [onAddToCart, product, quantity, variation]);

  const handleAddToCart = useCallback(() => {
    if (cartAdding || !variation.canAddToCart) return;
    setCartAdding(true);
    runAddToCart();
    void playCartFlyAnimation({
      fromElement: galleryRef.current,
      imageSrc: flyImageSrc,
      prefersReducedMotion: Boolean(reduceMotion),
    }).finally(() => setCartAdding(false));
  }, [
    cartAdding,
    flyImageSrc,
    reduceMotion,
    runAddToCart,
    variation.canAddToCart,
  ]);

  const handleBuyNow = useCallback(() => {
    if (!onBuyNow || !variation.canAddToCart) return;
    onBuyNow(product, quantity, variation.buildAddOptions());
  }, [onBuyNow, product, quantity, variation]);

  const variationPicker = variation.isVariable ? (
    <ProductVariationPicker
      attributeNames={variation.attributeNames}
      optionsByName={optionsByName}
      selected={variation.selectedAttributes}
      onSelect={variation.selectAttribute}
      disabled={variation.variationsQuery.isPending}
      className="mt-4 border-t border-slate-100 pt-4"
    />
  ) : null;

  return (
    <div
      className={cn(
        "min-w-0 space-y-6 sm:space-y-8 lg:space-y-10",
        stickyCartVisible && variation.displayInStock && "pb-24 max-lg:pb-mobile-commerce",
      )}
    >
      <ProductDetailBreadcrumbs product={product} className="text-xs sm:text-sm" />

      <div
        className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,24rem)] lg:items-start lg:gap-8"
        aria-label="تفاصيل المنتج والشراء"
      >
        <div className="min-w-0 max-lg:rounded-2xl max-lg:border max-lg:border-slate-200 max-lg:bg-white max-lg:p-2 max-lg:shadow-sm lg:sticky lg:top-24 lg:self-start">
          <ProductGallery
            ref={galleryRef}
            images={product.images}
            productName={product.name}
            fallbackSrc={variation.displayThumbnail}
            priority
            galleryBadge={badge}
            floatingAction={
              product3DModel?.src ? (
                <Product3DButton
                  modelSrc={product3DModel.src}
                  productName={product.name}
                  posterSrc={product3DPosterSrc}
                />
              ) : null
            }
            onActiveImageChange={setFlyImageSrc}
          />
        </div>
        <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <ProductDetailInfoColumn
            ref={purchaseRef}
            product={product}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            addToCartLoading={cartAdding}
            onBuyNow={
              onBuyNow && variation.displayInStock ? handleBuyNow : undefined
            }
            canInteractCart={canInteractCart && !cartAdding && variation.canAddToCart}
            displayPrice={variation.displayPrice}
            displayRegularPrice={variation.displayRegularPrice}
            displayOnSale={variation.displayOnSale}
            displayInStock={variation.displayInStock}
            priceRangeLabel={priceRangeLabel}
            selectionHint={variation.selectionHint}
            variationPicker={variationPicker}
          />
        </div>
      </div>

      <ProductTrustStrip trustSummary={trustSummary} />

      <ProductDetailContentSections
        product={product}
        specs={specs ?? []}
        benefits={benefits}
        reviewsSectionId="product-reviews-section"
      />

      <ProductDetailStickyCart
        product={product}
        imageSrc={flyImageSrc}
        visible={stickyCartVisible}
        displayPrice={variation.displayPrice}
        displayInStock={variation.displayInStock}
        canAddToCart={variation.canAddToCart}
        onAddToCart={handleAddToCart}
        addToCartLoading={cartAdding}
        canInteractCart={canInteractCart && !cartAdding && variation.canAddToCart}
      />
    </div>
  );
}
