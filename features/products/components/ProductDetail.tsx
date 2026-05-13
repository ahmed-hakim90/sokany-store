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
import { ProductDetailDescriptionBlocks } from "@/features/products/components/product-detail-description-blocks";
import { ProductDetailImageGallery } from "@/features/products/components/product-detail-image-gallery";
import { ProductSpecsList } from "@/features/products/components/ProductSpecsList";
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

type ProductDetailTab = "description" | "specs" | "gallery";

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
  const [activeTab, setActiveTab] = useState<ProductDetailTab>("description");
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
        "min-w-0 space-y-8 lg:space-y-10",
        stickyCartVisible && product.inStock && "pb-20 md:pb-24",
      )}
    >
      <ProductDetailBreadcrumbs product={product} className="text-xs sm:text-sm" />

      <section
        className="grid min-w-0 gap-5 rounded-[2rem] border border-slate-200 bg-white/85 p-3 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.42)] sm:p-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:gap-7"
        aria-label="تفاصيل المنتج والشراء"
      >
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
        <ProductDetailInfoColumn
          ref={purchaseRef}
          product={product}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
          onBuyNow={
            onBuyNow && product.inStock ? () => onBuyNow(product, quantity) : undefined
          }
          canInteractCart={canInteractCart}
        />
      </section>

      <ProductTrustStrip trustSummary={trustSummary} />

      <ProductDetailContentTabs
        product={product}
        specs={specs ?? []}
        benefits={benefits}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

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

function ProductDetailContentTabs({
  product,
  specs,
  benefits,
  activeTab,
  onTabChange,
}: {
  product: Product;
  specs: ProductSpecItem[];
  benefits: string[];
  activeTab: ProductDetailTab;
  onTabChange: (tab: ProductDetailTab) => void;
}) {
  const tabs: { id: ProductDetailTab; label: string; count?: number }[] = [
    { id: "description", label: "الوصف" },
    { id: "specs", label: "المواصفات", count: specs.length || undefined },
    { id: "gallery", label: "صور إضافية", count: product.images.length || undefined },
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_48px_-36px_rgba(15,23,42,0.4)]">
      <div
        className="flex gap-1 overflow-x-auto border-b border-slate-100 bg-slate-50/70 p-2"
        role="tablist"
        aria-label="أقسام تفاصيل المنتج"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold transition-colors",
              activeTab === tab.id
                ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:bg-white/70 hover:text-slate-900",
            )}
            onClick={() => onTabChange(tab.id)}
            aria-selected={activeTab === tab.id}
            aria-controls={`product-detail-panel-${tab.id}`}
            id={`product-detail-tab-${tab.id}`}
          >
            {tab.label}
            {tab.count ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <div
        className="p-4 sm:p-5"
        role="tabpanel"
        id={`product-detail-panel-${activeTab}`}
        aria-labelledby={`product-detail-tab-${activeTab}`}
      >
        {activeTab === "description" ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
            <ProductDetailDescriptionBlocks product={product} />
            {benefits.length > 0 ? (
              <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <h2 className="font-display text-base font-bold text-slate-950">
                  أبرز ما يميز المنتج
                </h2>
                <ul className="mt-3 grid gap-2">
                  {benefits.map((item) => (
                    <li
                      key={item}
                      className="flex min-w-0 items-start gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium leading-relaxed text-slate-800"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-950" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}
        {activeTab === "specs" ? (
          <ProductSpecsList
            items={specs}
            title="المواصفات التقنية"
            variant="panel"
          />
        ) : null}
        {activeTab === "gallery" ? <ProductDetailImageGallery product={product} /> : null}
      </div>
    </section>
  );
}
