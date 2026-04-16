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
};

export function ProductGallery({
  images,
  productName,
  fallbackSrc,
  priority,
  className,
}: ProductGalleryProps) {
  const list = images.length > 0 ? images : [];
  const initial = list[0]?.src ?? fallbackSrc;
  const [activeSrc, setActiveSrc] = useState(initial);

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-image-well">
        <AppImage
          src={activeSrc}
          alt={productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority={priority}
        />
      </div>
      {list.length > 1 ? (
        <>
          <div className="hidden gap-2 sm:grid sm:grid-cols-4">
            {list.map((img) => (
              <button
                key={img.id}
                type="button"
                aria-label={`Show image ${img.alt || productName}`}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-md border border-border bg-image-well transition-[border-color,ring]",
                  activeSrc === img.src
                    ? "border-brand-900 ring-2 ring-brand-500/40"
                    : "border-brand-100 hover:border-brand-300",
                )}
                onClick={() => setActiveSrc(img.src)}
              >
                <AppImage src={img.src} alt={img.alt} fill sizes="120px" />
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {list.map((img) => (
              <button
                key={img.id}
                type="button"
                aria-label={`Show image ${img.alt || productName}`}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-image-well transition-[border-color,ring]",
                  activeSrc === img.src
                    ? "border-brand-900 ring-2 ring-brand-500/40"
                    : "border-brand-100",
                )}
                onClick={() => setActiveSrc(img.src)}
              >
                <AppImage src={img.src} alt={img.alt} fill sizes="64px" />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
