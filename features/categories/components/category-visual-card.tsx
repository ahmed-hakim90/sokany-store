"use client";

import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { CategoryIcon } from "@/features/categories/category-icon-registry";
import type { Category } from "@/features/categories/types";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type CategoryVisualCardProps = {
  category: Category;
  href?: string;
  active?: boolean;
  onPrefetch?: () => void;
  scroll?: boolean;
  className?: string;
  linkMode?: "slug" | "productsQuery";
};

/*
 * بطاقة تصنيف مرئية — سكة اكتشاف أفقية (صورة/أيقونة + اسم + عدد).
 */
export function CategoryVisualCard({
  category,
  href,
  active = false,
  onPrefetch,
  scroll = false,
  className,
  linkMode = "productsQuery",
}: CategoryVisualCardProps) {
  const target =
    href ??
    (linkMode === "productsQuery"
      ? `${ROUTES.PRODUCTS}?category=${category.id}`
      : ROUTES.CATEGORY(category.slug));

  const countLabel =
    category.count > 0
      ? `${category.count} ${category.count === 1 ? "منتج" : "منتجات"}`
      : null;

  return (
    <Link
      href={target}
      scroll={scroll}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      data-category-discovery-active={active ? true : undefined}
      className={cn(
        "group flex w-[6.75rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        active
          ? "border-brand-950 ring-2 ring-brand-950/20"
          : "border-border/70",
        className,
      )}
    >
      <div className="relative aspect-square w-full bg-gradient-to-b from-slate-100 to-slate-200/80">
        {category.image ? (
          <AppImage
            src={category.image}
            alt=""
            fill
            sizes="108px"
            className="object-contain object-center p-2 transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-brand-800">
            <CategoryIcon slug={category.slug} className="h-10 w-10 sm:h-11 sm:w-11" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 px-2 pb-2 pt-1.5 text-center">
        <span className="line-clamp-2 text-[11px] font-bold leading-tight text-brand-950">
          {category.name}
        </span>
        {countLabel ? (
          <span className="text-[10px] font-medium text-muted-foreground">{countLabel}</span>
        ) : null}
      </div>
    </Link>
  );
}
