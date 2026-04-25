"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AppImage } from "@/components/AppImage";
import { ProductGalleryLightbox } from "@/features/products/components/product-gallery-lightbox";
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
    const list = images.length > 0 ? images : [];
    const initial = list[0]?.src ?? fallbackSrc;
    const [activeSrc, setActiveSrc] = useState(initial);
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

    const overflowCount = list.length > THUMB_MAX_INLINE ? list.length - (THUMB_MAX_INLINE - 1) : 0;
    const showOverflowTile = overflowCount > 0;
    const thumbSlice = showOverflowTile ? list.slice(0, THUMB_MAX_INLINE - 1) : list;

    const lightbox =
      lightboxOpen && typeof document !== "undefined"
        ? createPortal(
            <ProductGalleryLightbox
              open={lightboxOpen}
              onClose={closeLightbox}
              activeSrc={activeSrc}
              productName={productName}
              titleId={titleId}
            />,
            document.body,
          )
        : null;

    return (
      <div className={cn("flex min-w-0 flex-col gap-3", className)}>
        <div
          ref={ref}
          className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-image-well shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)]"
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
                shimmerUntilLoaded
                usePlaceholderOnError={false}
              />
            </motion.div>
          </AnimatePresence>
          {galleryBadge ? (
            <span className="pointer-events-none absolute end-3 top-3 z-10 rounded-md bg-brand-500 px-2.5 py-1 font-display text-[10px] font-bold uppercase leading-none tracking-wide text-black shadow-sm">
              {galleryBadge}
            </span>
          ) : null}
          <button
            type="button"
            className="absolute inset-0 z-[5] cursor-zoom-in bg-transparent"
            aria-label={`تكبير صورة ${productName}`}
            onClick={() => setLightboxOpen(true)}
          />
          <span className="pointer-events-none absolute end-2 bottom-2 z-[6] flex items-center gap-1 rounded-lg bg-black/45 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            <ZoomIcon className="h-3.5 w-3.5 opacity-90" />
            تكبير
          </span>
        </div>
        {list.length > 1 ? (
          <div
            className="flex touch-pan-x gap-2 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {showOverflowTile ? (
              <button
                type="button"
                aria-label={`عرض ${overflowCount} صور إضافية`}
                className="relative h-[4.25rem] w-[4.25rem] shrink-0 snap-start overflow-hidden rounded-xl border-2 border-dashed border-brand-400/70 bg-brand-50/90 text-[0.95rem] font-bold text-brand-900 transition-[border-color,ring] hover:border-brand-500 hover:bg-brand-100"
                onClick={() => setActiveSrc(list[THUMB_MAX_INLINE - 1]?.src ?? list[0].src)}
              >
                <span className="flex h-full  items-center justify-center">+{overflowCount}</span>
              </button>
            ) : null}
            {thumbSlice.map((img) => (
              <button
                key={img.id}
                type="button"
                aria-label={`عرض صورة ${img.alt || productName}`}
                className={cn(
                  "relative h-[4.25rem] w-[4.25rem] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-image-well transition-[border-color,ring]",
                  activeSrc === img.src
                    ? "border-brand-900 ring-2 ring-brand-500/40"
                    : "border-brand-100 hover:border-brand-300",
                )}
                onClick={() => setActiveSrc(img.src)}
              >
                <AppImage
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="72px"
                  shimmerUntilLoaded
                  usePlaceholderOnError={false}
                />
              </button>
            ))}
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
