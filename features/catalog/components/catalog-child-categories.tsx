"use client";

import { CategoryNavChip } from "@/features/categories/components/category-nav-chip";
import type { Category } from "@/features/categories/types";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type CatalogChildCategoriesProps = {
  subcategories: Category[];
  activeCategoryId?: number | null;
  className?: string;
};

/*
 * تصنيفات فرعية — شريحة أفقية تحت بانر التصنيف الأب.
 */
export function CatalogChildCategories({
  subcategories,
  activeCategoryId,
  className,
}: CatalogChildCategoriesProps) {
  if (subcategories.length === 0) return null;

  return (
    <section
      className={cn("min-w-0", className)}
      aria-label="تصنيفات فرعية"
    >
      <p className="mb-2 text-xs font-bold text-muted-foreground">أقسام فرعية</p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {subcategories.map((child) => (
          <CategoryNavChip
            key={child.id}
            href={`${ROUTES.PRODUCTS}?category=${child.id}`}
            label={child.name}
            count={child.count > 0 ? child.count : null}
            imageSrc={child.image}
            iconSlug={child.slug}
            active={activeCategoryId === child.id}
            scroll={false}
          />
        ))}
      </div>
    </section>
  );
}
