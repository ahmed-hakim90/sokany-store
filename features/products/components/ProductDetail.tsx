"use client";

/**
 * كتلة PDP (معرض + معلومات + شريط لاصق)
 * بالعامية: يظبط الكمية، يشغّل أنيميشن الطيران للسلة لو الحركة مسموحة، ويعرض `ProductDetailStickyCart` لما منطقة الشراء تطلع من الشاشة.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import {
  Banknote,
  Building2,
  FileCheck2,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { ProductDetailInfoColumn } from "@/features/products/components/product-detail-info-column";
import { ProductDetailStickyCart } from "@/features/products/components/product-detail-sticky-cart";
import { Product3DButton } from "@/features/products/components/Product3DButton";
import { ProductGallery } from "@/features/products/components/ProductGallery";
import { ProductDetailBreadcrumbs } from "@/features/products/components/product-detail-breadcrumbs";
import { ProductDetailContentSections } from "@/features/products/components/product-detail-content-sections";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import type { ProductTrustSummary } from "@/components/pages/ProductDetailPageContent";
import type { ProductSpecItem } from "@/features/products/components/ProductSpecsList";
import { getProductGalleryBadge } from "@/features/products/lib/product-gallery-badge";
import { getProductBenefitBullets } from "@/features/products/lib/product-merchandising";
import { useProduct3DModel } from "@/features/products/hooks/useProduct3DModel";
import type { Product } from "@/features/products/types";
import { playCartFlyAnimation } from "@/lib/cart-fly-animation";
import { ROUTES } from "@/lib/constants";
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
  const [cartAdding, setCartAdding] = useState(false);
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
    if (cartAdding) return;
    setCartAdding(true);
    onAddToCart(product, quantity);
    void playCartFlyAnimation({
      fromElement: galleryRef.current,
      imageSrc: flyImageSrc,
      prefersReducedMotion: Boolean(reduceMotion),
    }).finally(() => setCartAdding(false));
  }, [cartAdding, flyImageSrc, onAddToCart, product, quantity, reduceMotion]);

  return (
    <div
      className={cn(
        "min-w-0 space-y-6 sm:space-y-8 lg:space-y-10",
        stickyCartVisible && product.inStock && "pb-24 max-lg:pb-mobile-commerce",
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
            fallbackSrc={product.thumbnail}
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
              onBuyNow && product.inStock ? () => onBuyNow(product, quantity) : undefined
            }
            canInteractCart={canInteractCart && !cartAdding}
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
        onAddToCart={handleAddToCart}
        addToCartLoading={cartAdding}
        canInteractCart={canInteractCart && !cartAdding}
      />
    </div>
  );
}

function ProductTrustStrip({
  trustSummary,
}: {
  trustSummary?: ProductTrustSummary;
}) {
  const branchTotal =
    (trustSummary?.salesBranchesCount ?? 0) +
    (trustSummary?.serviceBranchesCount ?? 0);
  const items = [
    {
      title: "ضمان الوكيل",
      body: "سنة ضد عيوب الصناعة",
      icon: ShieldCheck,
      href: ROUTES.WARRANTY,
    },
    {
      title: "دفع عند الاستلام",
      body: "ادفع عند استلام طلبك",
      icon: Banknote,
      href: ROUTES.CHECKOUT,
    },
    {
      title: "استبدال واسترجاع",
      body: "حسب الشروط خلال 14 يوم",
      icon: RotateCcw,
      href: ROUTES.RETURNS_POLICY,
    },
    {
      title: "توصيل سريع",
      body: "خلال 1-3 أيام عمل",
      icon: Truck,
      href: ROUTES.CONTACT,
    },
  ];

  return (
    <section
      className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_14px_44px_-34px_rgba(15,23,42,0.42)] sm:grid-cols-2 lg:grid-cols-4"
      aria-label="مزايا الشراء والثقة"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.title}
            href={item.href}
            className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-white hover:shadow-sm"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-900 ring-1 ring-slate-200">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-sm font-bold text-slate-950">
                {item.title}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {item.body}
              </span>
            </span>
          </Link>
        );
      })}
      <Link
        href={ROUTES.SERVICE_CENTERS}
        className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-white hover:shadow-sm sm:col-span-2 lg:col-span-4"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-900 ring-1 ring-slate-200">
          <Building2 className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-sm font-bold text-slate-950">
            {branchTotal > 0 ? `${branchTotal} فرع ومركز خدمة` : "فروع ومراكز خدمة"}
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">
            بيع وصيانة ودعم داخل مصر، والتفاصيل النهائية حسب فاتورة الشراء.
          </span>
        </span>
        <FileCheck2 className="ms-auto hidden h-5 w-5 text-slate-300 sm:block" aria-hidden />
      </Link>
    </section>
  );
}

