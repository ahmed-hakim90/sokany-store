"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AppImage } from "@/components/AppImage";
import { ProductGalleryLightbox } from "@/features/products/components/product-gallery-lightbox";
import { usePointerSwipe } from "@/hooks/usePointerSwipe";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/features/products/types";

export type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
  fallbackSrc: string;
  priority?: boolean;
  className?: string;
  /** Short label over the main image (e.g. NEW TECH). */
  galleryBadge?: string | null;
  /** Fires when the large preview image changes (e.g. add-to-cart fly animation). */
  onActiveImageChange?: (src: string) => void;
};

const THUMB_MAX_INLINE = 4;

export const ProductGallery = forwardRef<HTMLDivElement, ProductGalleryProps>(
  function ProductGallery(
    {
      images,
      productName,
      fallbackSrc,
      priority,
      className,
      galleryBadge,
      onActiveImageChange,
    },
    ref,
  ) {
    const list = useMemo(() => (images.length > 0 ? images : []), [images]);
    const initial = list[0]?.src ?? fallbackSrc;
    const [activeSrc, setActiveSrc] = useState(initial);
    const activeIndex = Math.max(0, list.findIndex((img) => img.src === activeSrc));
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const reduceMotion = useReducedMotion();
    const titleId = useId();

    useEffect(() => {
      onActiveImageChange?.(activeSrc);
    }, [activeSrc, onActiveImageChange]);

    useEffect(() => {
      if (!lightboxOpen) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }, [lightboxOpen]);

    const closeLightbox = useCallback(() => setLightboxOpen(false), []);
    const goNext = useCallback(() => {
      if (list.length <= 1) return;
      const current = Math.max(0, list.findIndex((img) => img.src === activeSrc));
      setActiveSrc(list[current >= list.length - 1 ? 0 : current + 1]?.src ?? initial);
    }, [activeSrc, initial, list]);
    const goPrev = useCallback(() => {
      if (list.length <= 1) return;
      const current = Math.max(0, list.findIndex((img) => img.src === activeSrc));
      setActiveSrc(list[current <= 0 ? list.length - 1 : current - 1]?.src ?? initial);
    }, [activeSrc, initial, list]);
    const mainImageSwipe = usePointerSwipe({
      enabled: list.length > 1,
      onSwipeNext: goNext,
      onSwipePrev: goPrev,
      onTap: () => setLightboxOpen(true),
    });

    const overflowCount = list.length > THUMB_MAX_INLINE ? list.length - (THUMB_MAX_INLINE - 1) : 0;
    const showOverflowTile = overflowCount > 0;
    const thumbSlice = showOverflowTile ? list.slice(0, THUMB_MAX_INLINE - 1) : list;

    const lightbox =
      lightboxOpen && typeof document !== "undefined"
        ? createPortal(
            <ProductGalleryLightbox
              key={`${activeSrc}-${activeIndex}`}
              open={lightboxOpen}
              onClose={closeLightbox}
              images={list.length > 0 ? list : [{ id: 0, src: activeSrc, alt: productName }]}
              initialIndex={activeIndex >= 0 ? activeIndex : 0}
              productName={productName}
              titleId={titleId}
            />,
            document.body,
          )
        : null;

    const thumbRail = (
      <div
        className={cn(
          "flex touch-pan-x gap-2 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden",
          "lg:h-full lg:min-h-0 lg:w-[4.5rem] lg:snap-none lg:flex-col lg:touch-pan-y lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0 lg:pt-0",
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
        aria-label="معاينات صور المنتج"
      >
        {showOverflowTile ? (
          <button
            type="button"
            aria-label={`عرض ${overflowCount} صور إضافية`}
            className="relative h-[4.25rem] w-[4.25rem] shrink-0 snap-start overflow-hidden rounded-xl border-2 border-dashed border-brand-400/70 bg-brand-50/90 text-[0.95rem] font-bold text-brand-900 transition-[border-color,ring] hover:border-brand-500 hover:bg-brand-100 lg:w-full"
            onClick={() => setActiveSrc(list[THUMB_MAX_INLINE - 1]?.src ?? list[0].src)}
          >
            <span className="flex h-full items-center justify-center">+{overflowCount}</span>
          </button>
        ) : null}
        {thumbSlice.map((img) => (
          <button
            key={img.id}
            type="button"
            aria-label={`عرض صورة ${img.alt || productName}`}
            className={cn(
              "relative h-[4.25rem] w-[4.25rem] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-image-well transition-[border-color,ring] lg:w-full",
              activeSrc === img.src
                ? "border-brand-900 ring-2 ring-brand-500/40"
                : "border-brand-100 hover:border-brand-300",
            )}
            onClick={() => setActiveSrc(img.src)}
          >
            <AppImage
              src={img.src}
              alt={img.alt || productName}
              fill
              sizes="72px"
              className="object-contain object-center p-1"
              shimmerUntilLoaded
              usePlaceholderOnError={false}
            />
          </button>
        ))}
      </div>
    );

    return (
      <div
        className={cn(
          "flex min-w-0 flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-3",
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div
            ref={ref}
            className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.55)] ring-1 ring-white"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeSrc}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.28,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <AppImage
                  src={activeSrc}
                  alt={productName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={priority}
                  className="pointer-events-none object-contain object-center p-4 sm:p-6"
                  shimmerUntilLoaded
                  usePlaceholderOnError={false}
                />
              </motion.div>
            </AnimatePresence>
            {galleryBadge ? (
              <span className="pointer-events-none absolute end-3 top-3 z-10 rounded-full bg-brand-500 px-3 py-1.5 font-display text-[10px] font-bold uppercase leading-none tracking-wide text-black shadow-sm">
                {galleryBadge}
              </span>
            ) : null}
            <button
              type="button"
              className={cn(
                "absolute inset-0 z-[5] cursor-zoom-in bg-transparent select-none",
                list.length > 1 && "touch-none",
              )}
              aria-label={
                list.length > 1
                  ? `تمرير للصورة التالية أو السابقة، أو تكبير صورة ${productName}`
                  : `تكبير صورة ${productName}`
              }
              onClick={() => {
                if (list.length <= 1) setLightboxOpen(true);
              }}
              {...mainImageSwipe}
            />
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[6] flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
                <ZoomIcon className="h-3.5 w-3.5 opacity-90" />
                تكبير
              </span>
              {list.length > 1 ? (
                <span
                  dir="ltr"
                  className="rounded-full bg-white/90 px-2.5 py-1.5 text-[10px] font-extrabold text-slate-950 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm"
                >
                  {activeIndex + 1} / {list.length}
                </span>
              ) : null}
            </div>
          </div>
          {list.length > 1 ? (
            <div className="flex justify-center gap-1.5 lg:hidden" aria-hidden>
              {list.map((img) => (
                <span
                  key={img.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    img.src === activeSrc ? "w-6 bg-brand-500" : "w-1.5 bg-slate-300",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
        {list.length > 1 ? (
          <div className="min-w-0 shrink-0 lg:h-full lg:min-h-0 lg:self-stretch">
            {thumbRail}
          </div>
        ) : null}
        {lightbox}
      </div>
    );
  },
);

function ZoomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M11 8v6M8 11h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
