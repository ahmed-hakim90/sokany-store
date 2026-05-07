"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { AppImage } from "@/components/AppImage";
import { ProductGalleryLightbox } from "@/features/products/components/product-gallery-lightbox";
import type { Product, ProductImage } from "@/features/products/types";

function uniqueProductImages(product: Product): ProductImage[] {
  const seen = new Set<string>();
  const add = (img: ProductImage): ProductImage | null => {
    const src = img.src.trim();
    if (!src || seen.has(src)) return null;
    seen.add(src);
    return { ...img, src, alt: img.alt || product.name };
  };

  const out: ProductImage[] = [];
  for (const img of product.images) {
    const next = add(img);
    if (next) out.push(next);
  }

  if (out.length === 0 && product.thumbnail.trim()) {
    out.push({
      id: 0,
      src: product.thumbnail.trim(),
      alt: product.name,
    });
  }

  return out;
}

export function ProductDetailImageGallery({ product }: { product: Product }) {
  const images = uniqueProductImages(product);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const titleId = useId();
  const previewOpen = previewIndex !== null;

  useEffect(() => {
    if (!previewOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [previewOpen]);

  if (images.length === 0) return null;

  const lightbox =
    previewOpen && typeof document !== "undefined"
      ? createPortal(
          <ProductGalleryLightbox
            key={`${product.id}-${previewIndex}`}
            open={previewOpen}
            onClose={() => setPreviewIndex(null)}
            images={images}
            initialIndex={previewIndex}
            productName={product.name}
            titleId={titleId}
          />,
          document.body,
        )
      : null;

  return (
    <>
      <section
        className="rounded-2xl border border-border/80 bg-white/95 p-4 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.28)]"
        aria-labelledby="product-images-title"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="product-images-title"
            className="font-display text-sm font-bold text-brand-950"
          >
            صور المنتج
          </h2>
          <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
            {images.length} صور
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
          {images.map((img, index) => (
            <button
              key={`${img.id}-${img.src}`}
              type="button"
              className="group relative aspect-square min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-image-well transition-colors hover:border-brand-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              aria-label={`معاينة صورة المنتج رقم ${index + 1}`}
              onClick={() => setPreviewIndex(index)}
            >
              <AppImage
                src={img.src}
                alt={img.alt || product.name}
                fill
                sizes="(max-width: 1024px) 50vw, 18rem"
                className="object-contain object-center p-2 transition-transform duration-200 group-hover:scale-[1.03]"
                shimmerUntilLoaded
                usePlaceholderOnError={false}
              />
            </button>
          ))}
        </div>
      </section>
      {lightbox}
    </>
  );
}
