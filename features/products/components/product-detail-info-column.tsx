"use client";

import { forwardRef, useState } from "react";
import {
  MessageCircle,
  ShieldCheck,
  Share2,
  Heart,
  Star,
} from "lucide-react";
import { Button } from "@/components/Button";
import { PriceText } from "@/components/ui/price-text";
import { QtyControl } from "@/components/ui/qty-control";
import type { Product } from "@/features/products/types";
import { useWishlist } from "@/hooks/useWishlist";
import { WHATSAPP_SUPPORT_URL } from "@/lib/constants";
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
    canInteractCart?: boolean;
    className?: string;
  }
>(function ProductDetailInfoColumn(
  {
    product,
    quantity,
    onQuantityChange,
    onAddToCart,
    onBuyNow,
    canInteractCart = true,
    className,
  },
  ref,
) {
  const [shareCopied, setShareCopied] = useState(false);
  const { hasHydrated: wishlistReady, isInWishlist, toggleProduct } = useWishlist();
  const compareAt =
    product.onSale && product.salePrice !== null ? product.regularPrice : null;
  const pct = savePercent(product);
  const categoryLabel = product.categories[0]?.name;
  const ratingLabel = product.rating > 0 ? product.rating.toFixed(1) : "جديد";
  const wishlistPressed = isInWishlist(product.id);

  async function handleShare() {
    const url = window.location.href;
    const shareData = {
      title: product.name,
      text: `شاهد ${product.name} على Sokany Store`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 1800);
  }

  return (
    <div className={cn("min-w-0", className)}>
      <article
        ref={ref}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_55px_-36px_rgba(15,23,42,0.42)] sm:p-6"
      >
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {categoryLabel ? (
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                {categoryLabel}
              </span>
            ) : null}
            {pct != null && pct > 0 ? (
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-900 ring-1 ring-brand-300/60">
                خصم {pct}%
              </span>
            ) : null}
          </div>
          <h1 className="text-pretty font-display text-2xl font-bold leading-snug tracking-tight text-slate-950 sm:text-3xl">
            {product.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex text-amber-400" aria-hidden>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "h-3.5 w-3.5",
                      product.rating >= index + 1 ? "fill-current" : "fill-none text-slate-300",
                    )}
                  />
                ))}
              </span>
              <span className="font-semibold text-slate-700">{ratingLabel}</span>
              {product.ratingCount > 0 ? (
                <span>({product.ratingCount} تقييم)</span>
              ) : null}
            </span>
            {product.sku ? <span>SKU: {product.sku}</span> : null}
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <PriceText
              amount={product.price}
              compareAt={compareAt}
              emphasized
              className="text-slate-950"
              amountClassName="!text-3xl sm:!text-4xl"
            />
            {compareAt != null ? (
              <span className="text-sm font-medium text-slate-400 line-through">
                {formatPrice(compareAt)}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            الأسعار تشمل ضريبة القيمة المضافة عند تطبيقها. الشحن يحسب عند إتمام الطلب.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          {product.inStock ? (
            <span className="inline-flex items-center gap-2 font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              متوفر في المخزون
            </span>
          ) : (
            <span className="font-semibold text-rose-700">غير متوفر حالياً</span>
          )}
          {product.stockQuantity != null ? (
            <span className="text-xs text-slate-500">المتبقي: {product.stockQuantity}</span>
          ) : null}
        </div>

        {product.inStock ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">الكمية</span>
            <QtyControl
              value={quantity}
              min={1}
              max={99}
              onChange={onQuantityChange}
              disabled={!product.inStock || !canInteractCart}
              layout="segmented"
              className="max-w-[11rem]"
            />
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-2.5">
          <Button
            size="lg"
            className={cn(
              "relative h-12 gap-0 border-0 bg-slate-950 text-base font-bold text-white shadow-md hover:bg-slate-800",
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
              className="h-12 border-slate-300 bg-white text-base font-semibold text-slate-950 hover:bg-slate-50"
              disabled={!product.inStock || !canInteractCart}
              onClick={onBuyNow}
            >
              شراء الآن
            </Button>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden />
            ضمان
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-bold transition-colors",
              wishlistPressed
                ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            )}
            disabled={!wishlistReady}
            aria-pressed={wishlistPressed}
            onClick={() => toggleProduct(product)}
          >
            <Heart
              className={cn("h-4 w-4", wishlistPressed && "fill-current")}
              aria-hidden
            />
            {wishlistPressed ? "في المفضلة" : "مفضلة"}
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
            onClick={() => void handleShare()}
          >
            <Share2 className="h-4 w-4" aria-hidden />
            {shareCopied ? "تم النسخ" : "مشاركة"}
          </button>
        </div>

        {WHATSAPP_SUPPORT_URL ? (
          <a
            href={`${WHATSAPP_SUPPORT_URL}${WHATSAPP_SUPPORT_URL.includes("?") ? "&" : "?"}text=${encodeURIComponent(`استفسار عن ${product.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-950 transition-colors hover:bg-emerald-100"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            اسأل عن المنتج على واتساب
          </a>
        ) : null}
      </article>
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
