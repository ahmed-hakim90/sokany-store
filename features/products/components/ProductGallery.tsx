"use client";

import { useState } from "react";
import { AppImage } from "@/components/AppImage";
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
};

const THUMB_MAX_INLINE = 4;

export function ProductGallery({
  images,
  productName,
  fallbackSrc,
  priority,
  className,
  galleryBadge,
}: ProductGalleryProps) {
  const list = images.length > 0 ? images : [];
  const initial = list[0]?.src ?? fallbackSrc;
  const [activeSrc, setActiveSrc] = useState(initial);

  const overflowCount = list.length > THUMB_MAX_INLINE ? list.length - (THUMB_MAX_INLINE - 1) : 0;
  const showOverflowTile = overflowCount > 0;
  const thumbSlice = showOverflowTile ? list.slice(0, THUMB_MAX_INLINE - 1) : list;

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-image-well shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)]">
        <AppImage
          src={activeSrc}
          alt={productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={priority}
        />
        {galleryBadge ? (
          <span className="absolute end-3 top-3 z-10 rounded-md bg-brand-500 px-2.5 py-1 font-display text-[10px] font-bold uppercase leading-none tracking-wide text-black shadow-sm">
            {galleryBadge}
          </span>
        ) : null}
      </div>
      {list.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {showOverflowTile ? (
            <button
              type="button"
              aria-label={`عرض ${overflowCount} صور إضافية`}
              className="relative h-[4.25rem] w-[4.25rem] shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-brand-400/70 bg-brand-50/90 text-[0.95rem] font-bold text-brand-900 transition-[border-color,ring] hover:border-brand-500 hover:bg-brand-100"
              onClick={() => setActiveSrc(list[THUMB_MAX_INLINE - 1]?.src ?? list[0].src)}
            >
              <span className="flex h-full w-full items-center justify-center">+{overflowCount}</span>
            </button>
          ) : null}
          {thumbSlice.map((img) => (
            <button
              key={img.id}
              type="button"
              aria-label={`عرض صورة ${img.alt || productName}`}
              className={cn(
                "relative h-[4.25rem] w-[4.25rem] shrink-0 overflow-hidden rounded-xl border border-border bg-image-well transition-[border-color,ring]",
                activeSrc === img.src
                  ? "border-brand-900 ring-2 ring-brand-500/40"
                  : "border-brand-100 hover:border-brand-300",
              )}
              onClick={() => setActiveSrc(img.src)}
            >
              <AppImage src={img.src} alt={img.alt} fill sizes="72px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
