"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { IconButton } from "@/components/ui/icon-button";
import { PriceText } from "@/components/ui/price-text";
import { ROUTES } from "@/lib/constants";
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
    if (!open) {
      setIndex(0);
      return;
    }
    const t = requestAnimationFrame(() => {
      closeRef.current?.focus();
    });
    return () => cancelAnimationFrame(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const plainDesc = stripHtml(product.shortDescription || product.description || "");
  const excerpt =
    plainDesc.length > 320 ? `${plainDesc.slice(0, 320).trim()}…` : plainDesc;

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? slides.length - 1 : i - 1));
  }, [slides.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= slides.length - 1 ? 0 : i + 1));
  }, [slides.length]);

  if (!mounted || !open) return null;

  const slide = slides[index] ?? slides[0];

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="إغلاق النافذة"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={excerpt ? descId : undefined}
        className={cn(
          "relative z-[201] flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border/80 bg-white shadow-2xl",
          "sm:rounded-2xl",
        )}
      >
        <div className="flex items-start justify-between gap-2 border-b border-border/60 px-4 py-3">
          <h2 id={titleId} className="min-w-0 flex-1 text-base font-bold leading-snug text-neutral-950">
            {product.name}
          </h2>
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
          <div className="relative aspect-square w-full bg-white">
            <AppImage
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 640px) 100vw, 32rem"
              className="object-contain"
            />
            {slides.length > 1 ? (
              <>
                {/* RTL: التالي على start (يمين الشاشة)، السابق على end (يسار) */}
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute start-2 top-1/2 z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white/95 text-foreground shadow-md backdrop-blur-sm transition hover:bg-white"
                  aria-label="الصورة التالية"
                >
                  <ChevronFwd />
                </button>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute end-2 top-1/2 z-[2] flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white/95 text-foreground shadow-md backdrop-blur-sm transition hover:bg-white"
                  aria-label="الصورة السابقة"
                >
                  <ChevronBack />
                </button>
                <div className="absolute bottom-3 left-1/2 z-[2] flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2 py-1.5 backdrop-blur-sm">
                  {slides.map((s, i) => (
                    <button
                      key={s.key}
                      type="button"
                      aria-label={`صورة ${i + 1} من ${slides.length}`}
                      aria-current={i === index}
                      className={cn(
                        "h-2 w-2 rounded-full transition",
                        i === index ? "bg-white" : "bg-white/45 hover:bg-white/70",
                      )}
                      onClick={() => setIndex(i)}
                    />
                  ))}
                </div>
              </>
            ) : null}
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
              "inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold transition-colors sm:flex-none sm:min-w-[10rem]",
              addToCartDisabled
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : "bg-brand-500 text-black hover:bg-brand-400",
            )}
          >
            <CartIcon />
            <span>{justAdded ? "تمت الإضافة" : "أضف للسلة"}</span>
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

function ChevronBack() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M14 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronFwd() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M10 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden>
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
