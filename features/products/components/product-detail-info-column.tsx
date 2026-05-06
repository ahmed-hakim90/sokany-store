"use client";

import { forwardRef } from "react";
import {
  BadgeCheck,
  Banknote,
  Building2,
  FileCheck2,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link } from "next-view-transitions";
import { Button } from "@/components/Button";
import { PriceText } from "@/components/ui/price-text";
import { QtyControl } from "@/components/ui/qty-control";
import { ProductDetailBreadcrumbs } from "@/features/products/components/product-detail-breadcrumbs";
import { ProductDetailDescriptionBlocks } from "@/features/products/components/product-detail-description-blocks";
import {
  ProductSpecsList,
  type ProductSpecItem,
} from "@/features/products/components/ProductSpecsList";
import { useProductMerchandising } from "@/features/products/components/product-merchandising-context";
import { getProductBenefitBullets } from "@/features/products/lib/product-merchandising";
import type { ProductTrustSummary } from "@/components/pages/ProductDetailPageContent";
import type { Product } from "@/features/products/types";
import { ROUTES, WHATSAPP_SUPPORT_URL } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";

function savePercent(product: Product): number | null {
  if (!product.onSale || product.regularPrice <= 0) return null;
  if (product.regularPrice <= product.price) return null;
  return Math.round((1 - product.price / product.regularPrice) * 100);
}

export const ProductDetailInfoColumn = forwardRef<
  HTMLDivElement,
  {
    product: Product;
    quantity: number;
    onQuantityChange: (next: number) => void;
    onAddToCart: () => void;
    onBuyNow?: () => void;
    specs: ProductSpecItem[];
    canInteractCart?: boolean;
    trustSummary?: ProductTrustSummary;
    className?: string;
  }
>(function ProductDetailInfoColumn(
  {
    product,
    quantity,
    onQuantityChange,
    onAddToCart,
    onBuyNow,
    specs,
    canInteractCart = true,
    trustSummary,
    className,
  },
  ref,
) {
  const compareAt =
    product.onSale && product.salePrice !== null ? product.regularPrice : null;
  const pct = savePercent(product);
  const benefits = getProductBenefitBullets(product, 4);
  const categoryLabel = product.categories[0]?.name;
  const merchandising = useProductMerchandising();
  const branchTotal =
    (trustSummary?.salesBranchesCount ?? 0) +
    (trustSummary?.serviceBranchesCount ?? 0);

  return (
    <div className={cn("flex min-w-0 flex-col gap-5 lg:gap-6", className)}>
      <ProductDetailBreadcrumbs product={product} />

      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-baseline gap-1 rounded-2xl bg-white/95 px-3 py-2 font-display text-2xl font-extrabold text-slate-950 shadow-sm ring-1 ring-border/80">
            {formatPrice(product.price)}
          </span>
          {pct != null && pct > 0 ? (
            <span className="rounded-lg bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-900 ring-1 ring-brand-300/60">
              وفر {pct}%
            </span>
          ) : null}
        </div>
        <h1 className="text-pretty font-display text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-3xl">
          {product.name}
        </h1>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {product.inStock ? (
            <span className="text-emerald-700">متوفر للطلب</span>
          ) : (
            <span className="font-medium text-foreground">غير متوفر حالياً</span>
          )}
          {product.sku ? (
            <>
              <span className="mx-1.5 text-border">·</span>
              <span>SKU: {product.sku}</span>
            </>
          ) : null}
        </p>
      </div>

      <div
        ref={ref}
        className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-white/90 p-4 shadow-[0_10px_28px_-22px_rgba(15,23,42,0.35)]"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-muted-foreground">السعر</p>
            <PriceText
              amount={product.price}
              compareAt={compareAt}
              emphasized
              className="mt-1 text-brand-900"
              amountClassName="!text-3xl sm:!text-4xl"
            />
          </div>
        </div>

        {product.inStock ? (
          <QtyControl
            value={quantity}
            min={1}
            max={99}
            onChange={onQuantityChange}
            disabled={!product.inStock || !canInteractCart}
            layout="segmented"
            className=" max-w-[11rem] self-start"
          />
        ) : null}

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
          <Button
            size="lg"
            className={cn(
              "relative h-12 gap-0 border-0 bg-gradient-to-b from-brand-400 to-brand-500 text-base font-bold text-black shadow-md hover:from-brand-300 hover:to-brand-400 sm:flex-1",
            )}
            disabled={!product.inStock || !canInteractCart}
            onClick={onAddToCart}
            aria-label="أضف إلى السلة"
          >
            <span className="relative z-10 text-center">أضف إلى السلة</span>
            <span
              className="absolute start-3 top-1/2 z-0 -translate-y-1/2 sm:start-4"
              aria-hidden
            >
              <CartIcon className="h-6 w-6" />
            </span>
          </Button>
          {onBuyNow ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="h-12  border-border bg-white text-base font-semibold text-foreground hover:bg-surface-muted sm:w-auto sm:min-w-[9.5rem]"
              disabled={!product.inStock || !canInteractCart}
              onClick={onBuyNow}
            >
              شراء الآن
            </Button>
          ) : null}
        </div>

        {WHATSAPP_SUPPORT_URL ? (
          <a
            href={`${WHATSAPP_SUPPORT_URL}${WHATSAPP_SUPPORT_URL.includes("?") ? "&" : "?"}text=${encodeURIComponent(`استفسار عن ${product.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-950 transition-colors hover:bg-emerald-100"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            اسأل عن المنتج على واتساب
          </a>
        ) : null}
      </div>

      <section
        className="overflow-hidden rounded-2xl border border-slate-200/85 bg-white shadow-[0_12px_32px_-24px_rgba(15,23,42,0.42)]"
        aria-labelledby="product-policy-summary-title"
      >
        <div className="border-b border-slate-100 bg-gradient-to-l from-slate-950 via-slate-900 to-slate-800 px-4 py-3 text-white">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-accent">
            ثقة قبل الشراء
          </p>
          <h2
            id="product-policy-summary-title"
            className="mt-1 font-display text-base font-black"
          >
            ملخص الضمان والشروط
          </h2>
        </div>

        {merchandising.productCardBadgeEnabled ? (
          <div className="flex items-center gap-3 border-b border-slate-100 bg-brand-50/40 px-4 py-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-black shadow-sm">
              <BadgeCheck className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0 text-sm font-black text-brand-950">
              {merchandising.productCardBadgeText}
            </span>
          </div>
        ) : null}

        <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-100 border-b border-slate-100 bg-slate-50/50">
          <div className="flex min-w-0 items-center gap-2.5 p-3 sm:p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-900 shadow-sm ring-1 ring-slate-200/80">
              <Banknote className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="text-xs font-bold leading-tight text-slate-900 sm:text-[13px]">
              دفع عند الاستلام
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-2.5 p-3 sm:p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-900 shadow-sm ring-1 ring-slate-200/80">
              <Truck className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="text-xs font-bold leading-tight text-slate-900 sm:text-[13px]">
              شحن لجميع المحافظات
            </span>
          </div>
        </div>

        <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-x-reverse sm:divide-y-0">
          <Link
            href={ROUTES.WARRANTY}
            className="group flex min-w-0 gap-3 p-4 transition-colors hover:bg-slate-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-black shadow-sm">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-black text-slate-950">
                ضمان الوكيل سنة ضد عيوب الصناعة
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-600">
                التفاصيل الكاملة في سياسة الضمان.
              </span>
            </span>
          </Link>

          <Link
            href={ROUTES.RETURNS_POLICY}
            className="group flex min-w-0 gap-3 p-4 transition-colors hover:bg-slate-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
              <RotateCcw className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-black text-slate-950">
                استبدال واسترجاع
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-600">
                حسب الشروط والحالة المذكورة في السياسة.
              </span>
            </span>
          </Link>

          <Link
            href={ROUTES.SERVICE_CENTERS}
            className="group flex min-w-0 gap-3 p-4 transition-colors hover:bg-slate-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-950 shadow-sm ring-1 ring-brand-200">
              <Building2 className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-black text-slate-950">
                {branchTotal > 0 ? `${branchTotal} فرع ومركز خدمة` : "فروع ومراكز خدمة"}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-600">
                بيع وصيانة ودعم داخل مصر.
              </span>
            </span>
          </Link>
        </div>
        <div className="flex items-start gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-3 text-xs leading-5 text-slate-600">
          <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
          <p>
            التفاصيل النهائية للضمان والاستبدال تُطبق حسب حالة المنتج وفاتورة الشراء.
          </p>
        </div>
      </section>

      {benefits.length > 0 ? (
        <section
          className="rounded-2xl border border-border/80 bg-white/90 p-4 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.28)]"
          aria-labelledby="product-benefits-title"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="product-benefits-title"
              className="font-display text-sm font-bold text-brand-950"
            >
              أبرز ما يميز المنتج
            </h2>
            {categoryLabel ? (
              <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                {categoryLabel}
              </span>
            ) : null}
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {benefits.map((item) => (
              <li
                key={item}
                className="flex min-w-0 items-start gap-2 rounded-xl bg-surface-muted/55 px-3 py-2 text-sm font-medium leading-relaxed text-slate-800"
              >
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ProductSpecsList
        items={specs}
        title="المواصفات التقنية"
        variant="panel"
        className="border-t border-border/80 pt-5"
      />

      <ProductDetailDescriptionBlocks product={product} className="pt-2" />
    </div>
  );
});

function CartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" />
    </svg>
  );
}
