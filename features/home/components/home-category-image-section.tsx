"use client";

import { AppImage } from "@/components/AppImage";
import type { Category } from "@/features/categories/types";
import { cn } from "@/lib/utils";

export type HomeCategoryImageSectionProps = {
  category: Category;
  className?: string;
};

/** Full-width visual block only — no product row in this section. */
export function HomeCategoryImageSection({ category, className }: HomeCategoryImageSectionProps) {
  if (!category.image) return null;

  return (
    <section
      className={cn("min-w-0", className)}
      aria-label={`صورة قسم ${category.name}`}
    >
      <div className="relative aspect-[2/1]  overflow-hidden rounded-2xl border border-border bg-image-well">
        <AppImage
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 100vw, 896px"
          className="object-cover"
        />
      </div>
    </section>
  );
}
