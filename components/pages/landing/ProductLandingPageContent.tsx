"use client";

import { ShoppingCart, Zap } from "lucide-react";
import { Link, useTransitionRouter } from "next-view-transitions";
import { useMemo, useState } from "react";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { HomeFlashSaleCountdownStrip } from "@/features/home/components/home-flash-sale-countdown";
import { ProductDetailDescriptionBlocks } from "@/features/products/components/product-detail-description-blocks";
import type { Product } from "@/features/products/types";
import type { CmsProductLandingPage } from "@/schemas/cms";
import { useCart } from "@/hooks/useCart";
import { formatPriceEgp } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import { cn, stripHtml } from "@/lib/utils";

type ProductLandingPageContentProps = {
  product: Product;
  landingConfig: CmsProductLandingPage;
};

/*
 * صفحة هبوط منتج واحد (/landing/[slug]): داخل Container بعرض واسع.
 * الموبايل: عداد العرض ثم صورة المنتج ثم كارت الشراء في عمود واحد؛ md+: جريد عمودين، الصورة يمين والتفاصيل/الشراء يسار حسب RTL.
 * أسفل البطل: وصف المنتج الكامل في كارت مستقل بنفس عرض الصفحة، مع CTA يرجّع للمنتجات عند الحاجة.
 */
export function ProductLandingPageContent({
  product,
  landingConfig,
}: ProductLandingPageContentProps) {
  const router = useTransitionRouter();
  const { hasHydrated, getCartLineQuantity, setProductLineQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const images = useMemo(
    () =>
      product.images.length > 0
        ? product.images
        : [{ id: product.id, src: product.thumbnail, alt: product.name }],
    [product.id, product.images, product.name, product.thumbnail],
  );
  const [selectedImageSrc, setSelectedImageSrc] = useState(images[0]?.src ?? "");

  const selectedImage = useMemo(
    () => images.find((image) => image.src === selectedImageSrc) ?? images[0],
    [images, selectedImageSrc],
  );
  const title = landingConfig.customTitle?.trim() || product.name;
  const description =
    landingConfig.customDescription?.trim() ||
    stripHtml(product.shortDescription || product.description || "");
  const hasSalePrice = product.salePrice != null && product.salePrice < product.regularPrice;
  const canBuy = hasHydrated && product.inStock;

  function addToCart() {
    const current = getCartLineQuantity(product.id);
    setProductLineQuantity(product, current + quantity);
  }

  function buyNow() {
    setProductLineQuantity(product, quantity);
    router.push(ROUTES.CHECKOUT);
  }

  return (
    <Container className="py-5 sm:py-8 lg:py-10">
      <div className="space-y-6">
        {landingConfig.flashSale.enabled ? (
          <HomeFlashSaleCountdownStrip
            titleId="landing-flash-sale-title"
            endsAtIso={landingConfig.flashSale.endsAt}
            headline={landingConfig.flashSale.headline || "عرض فلاش على المنتج"}
            subline={
              landingConfig.flashSale.subline ||
              "خصم لفترة محدودة على المنتج المختار من لوحة التحكم."
            }
            ctaHref="#landing-product-purchase"
            ctaLabel="اغتنم العرض"
          />
        ) : null}

        {/* البطل: صورة المنتج وكارت الشراء يتجاوبان من عمود واحد إلى جريد عمودين. */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-start">
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_60px_-38px_rgba(15,23,42,0.5)]">
              {selectedImage ? (
                <AppImage
                  src={selectedImage.src}
                  alt={selectedImage.alt || product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  className="object-contain p-4 sm:p-8"
                  shimmerUntilLoaded
                />
              ) : null}
            </div>
            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((image) => (
                  <button
                    key={`${image.id}-${image.src}`}
                    type="button"
                    className={cn(
                      "relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-white transition sm:h-20 sm:w-20",
                      selectedImage?.src === image.src
                        ? "border-brand-500 ring-2 ring-brand-200"
                        : "border-slate-200 hover:border-brand-300",
                    )}
                    onClick={() => setSelectedImageSrc(image.src)}
                    aria-label={`عرض صورة ${image.alt || product.name}`}
                  >
                    <AppImage
                      src={image.src}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <article
            id="landing-product-purchase"
            className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.5)] sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-xs font-black text-brand-950">
                <Zap className="h-3.5 w-3.5" aria-hidden />
                Flash Sale
              </span>
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                SKU: {product.sku || product.id}
              </span>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold",
                  product.inStock
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700",
                )}
              >
                {product.inStock ? "متوفر الآن" : "غير متوفر حالياً"}
              </span>
            </div>

            <h1 className="mt-5 font-display text-3xl font-black leading-tight text-brand-950 sm:text-4xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 text-base leading-8 text-slate-700">{description}</p>
            ) : null}

            <div className="mt-6 rounded-3xl border border-brand-200 bg-brand-50/70 p-4">
              <p className="text-sm font-bold text-slate-600">السعر الآن</p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <span className="font-display text-3xl font-black text-brand-950">
                  {formatPriceEgp(product.price)}
                </span>
                {hasSalePrice ? (
                  <span className="pb-1 text-sm font-bold text-slate-500 line-through">
                    {formatPriceEgp(product.regularPrice)}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <label className="block">
                <span className="text-sm font-bold text-slate-800">الكمية</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={(event) => {
                    const next = Number.parseInt(event.target.value, 10);
                    setQuantity(Number.isFinite(next) ? Math.min(99, Math.max(1, next)) : 1);
                  }}
                  className="mt-1 h-12 w-full rounded-2xl border border-slate-200 px-3 text-center font-bold"
                />
              </label>
              <div className="grid gap-2 sm:grid-cols-2 sm:items-end">
                <Button
                  type="button"
                  className="h-12"
                  disabled={!canBuy}
                  onClick={addToCart}
                >
                  <ShoppingCart className="me-2 h-4 w-4" aria-hidden />
                  أضف للسلة
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-12"
                  disabled={!canBuy}
                  onClick={buyNow}
                >
                  اشتري الآن
                </Button>
              </div>
            </div>
            {!hasHydrated ? (
              <p className="mt-3 text-sm text-muted-foreground">جاري تجهيز السلة…</p>
            ) : null}
          </article>
        </section>

        {/* التفاصيل: نفس بلوكات صفحة المنتج حتى يظل الوصف والمواصفات بنفس لغة المتجر. */}
        <ProductDetailDescriptionBlocks product={product} />

        <div className="flex justify-center">
          <Link
            href={ROUTES.PRODUCT(product.id)}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
          >
            عرض صفحة المنتج الكاملة
          </Link>
        </div>
      </div>
    </Container>
  );
}
