"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { IconButton } from "@/components/ui/icon-button";
import { PriceText } from "@/components/ui/price-text";
import { usePointerSwipe } from "@/hooks/usePointerSwipe";
import { ROUTES } from "@/lib/constants";
import { ProductRatingDisplay } from "@/features/products/components/product-rating-display";
import { ProductStatusBadge } from "@/features/products/components/product-status-badge";
import { cn, stripHtml } from "@/lib/utils";
import type { Product } from "@/features/products/types";

export type ProductQuickViewModalProps = {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compareAt: number | null;
  onAddToCart: () => void;
  addToCartDisabled: boolean;
  justAdded: boolean;
};

function gallerySources(product: Product): { key: string; src: string; alt: string }[] {
  if (product.images.length > 0) {
    return product.images.map((img) => ({
      key: String(img.id),
      src: img.src,
      alt: img.alt || product.name,
    }));
  }
  return [{ key: "thumb", src: product.thumbnail, alt: product.name }];
}

export function ProductQuickViewModal({
  product,
  open,
  onOpenChange,
  compareAt,
  onAddToCart,
  addToCartDisabled,
  justAdded,
}: ProductQuickViewModalProps) {
  const titleId = useId();
  const descId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const slides = gallerySources(product);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [product.id]);

  useEffect(() => {
    if (!open) {
      setIndex(0);
      return;
    }
    const t = requestAnimationFrame(() => {
      closeRef.current?.focus();
    });
    return () => cancelAnimationFrame(t);
  }, [open]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? slides.length - 1 : i - 1));
  }, [slides.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= slides.length - 1 ? 0 : i + 1));
  }, [slides.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
        return;
      }
      if (slides.length <= 1) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange, slides.length, goNext, goPrev]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const root = document.documentElement;
    root.setAttribute("data-storefront-modal", "");
    return () => {
      root.removeAttribute("data-storefront-modal");
    };
  }, [open]);

  const gallerySwipe = usePointerSwipe({
    enabled: slides.length > 1,
    onSwipeNext: goNext,
    onSwipePrev: goPrev,
  });

  const plainDesc = stripHtml(product.shortDescription || product.description || "");
  const excerpt =
    plainDesc.length > 320 ? `${plainDesc.slice(0, 320).trim()}…` : plainDesc;

  if (!mounted || !open) return null;

  const slide = slides[index] ?? slides[0];

  return createPortal(
    <div
      className="fixed inset-0 z-[2500] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 bg-black/55 backdrop-blur-[2px] sm:bg-black/50"
        aria-label="إغلاق النافذة"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={excerpt ? descId : undefined}
        className={cn(
          "relative z-[1] flex w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border/80 bg-white shadow-2xl",
          /* موبايل: ارتفاع يعتمد على الشاشة + safe-area؛ لصق من الأسفل */
          "max-h-[calc(100svh-env(safe-area-inset-bottom,0px))] self-end",
          "sm:mx-auto sm:max-h-[min(92vh,720px)] sm:self-auto",
          "sm:rounded-2xl",
        )}
      >
        <div className="flex items-center justify-end border-b border-border/60 px-3 py-2 sm:px-4">
          <IconButton
            ref={closeRef}
            type="button"
            variant="subtle"
            size="sm"
            aria-label="إغلاق معاينة المنتج"
            className="shrink-0"
            onClick={() => onOpenChange(false)}
          >
            <CloseIcon />
          </IconButton>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="bg-white px-4 pt-2 sm:px-0 sm:pt-0">
            <div
              className={cn(
                "relative w-full touch-none select-none bg-white",
                /* ارتفاع أقل من المربع الكامل: حد أقصى للارتفاع + نسبة أوسع */
                "aspect-[4/3] max-h-[min(34vh,220px)] sm:aspect-square sm:max-h-[min(48vh,340px)]",
                slides.length > 1 && "cursor-grab active:cursor-grabbing",
              )}
              role="region"
              aria-roledescription="معرض صور"
              aria-label={slides.length > 1 ? `صورة ${index + 1} من ${slides.length}` : undefined}
              {...gallerySwipe}
            >
              <div className="absolute inset-0 p-2 sm:p-0">
                <AppImage
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 32rem"
                  className="pointer-events-none object-contain object-center"
                />
              </div>
            </div>
          </div>

          {slides.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto border-b border-border/50 bg-neutral-50/80 px-3 py-2.5 [scrollbar-width:thin]">
              {slides.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  aria-label={`صورة ${i + 1} من ${slides.length}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-2 transition ring-offset-2 ring-offset-neutral-50",
                    i === index
                      ? "ring-brand-500"
                      : "ring-transparent hover:ring-neutral-300",
                  )}
                >
                  <AppImage
                    src={s.src}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}

          <div className="border-b border-border/60 px-4 py-3">
            <h2 id={titleId} className="text-base font-bold leading-snug text-neutral-950">
              {product.name}
            </h2>
            <ProductRatingDisplay
              rating={product.rating}
              ratingCount={product.ratingCount}
              size="sm"
              className="mt-2"
            />
            <ProductStatusBadge product={product} className="mt-1.5" />
          </div>

          <div className="space-y-3 px-4 py-4">
            <div className="rounded-xl bg-surface-muted/50 px-3 py-3 ring-1 ring-border/50">
              <PriceText
                amount={product.price}
                compareAt={compareAt}
                amountClassName="text-2xl font-extrabold tracking-tight text-neutral-950 sm:text-3xl"
                compareAtClassName="!text-sm !text-neutral-400 sm:!text-base"
                className="!flex-col !items-start !gap-1.5 !gap-x-0"
              />
            </div>
            {excerpt ? (
              <p id={descId} className="text-sm leading-relaxed text-muted-foreground">
                {excerpt}
              </p>
            ) : (
              <p id={descId} className="text-sm text-muted-foreground">
                لا يوجد وصف مختصر متاح.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/60 bg-surface-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={ROUTES.PRODUCT(product.id)}
            className="text-center text-sm font-semibold text-brand-800 underline-offset-4 hover:underline"
            onClick={() => onOpenChange(false)}
          >
            صفحة المنتج الكاملة
          </Link>
          <button
            type="button"
            disabled={addToCartDisabled}
            onClick={onAddToCart}
            className={cn(
              "relative inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-xs font-extrabold leading-snug transition-colors sm:flex-none sm:min-w-[10rem] sm:px-5 sm:text-sm",
              addToCartDisabled
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-brand-500 text-black hover:bg-brand-400",
            )}
            aria-label={justAdded ? "تمت الإضافة للسلة" : "أضف للسلة"}
          >
            <span className="relative z-10 text-center">
              {justAdded ? "تمت الإضافة" : "أضف للسلة"}
            </span>
            <span
              className="absolute start-2 top-1/2 z-0 -translate-y-1/2 sm:start-2.5"
              aria-hidden
            >
              <CartIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("shrink-0", className)} aria-hidden>
      <path
        d="M3 4h2.2c.5 0 .93.33 1.06.81l.54 2.02m0 0L8 12h9.5a1 1 0 00.97-.76l1.2-4.8a.75.75 0 00-.73-.94H6.8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="18.2" r="1.3" fill="currentColor" />
      <circle cx="17" cy="18.2" r="1.3" fill="currentColor" />
    </svg>
  );
}
