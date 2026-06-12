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
        /* بطاقة كاملة الصورة — w-[5.5rem] h-[5.5rem] (مربع تقريباً، نفس حجم rail chip) */
        "group relative flex w-[5.5rem] h-[5.5rem] shrink-0 snap-start overflow-hidden rounded-xl border shadow-sm transition-all duration-200",
        "hover:shadow-md",
        active
          ? "border-brand-500 ring-2 ring-brand-500/30 shadow-md"   /* ليمي بدل أسود */
          : "border-border/70 hover:border-brand-400",
        className,
      )}
    >
      {/* خلفية محايدة */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-200/70" />

      {/* صورة أو أيقونة */}
      {category.image ? (
        <AppImage
          src={category.image}
          alt=""
          fill
          sizes="72px"
          className="object-contain object-center p-2 transition-transform duration-200 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center pb-6">
          <CategoryIcon slug={category.slug} className="h-9 w-9 text-brand-800 drop-shadow-[0_1px_2px_rgba(15,23,42,0.15)]" />
        </div>
      )}

      {/* طبقة active */}
      {active ? <div className="absolute inset-0 bg-brand-500/10 pointer-events-none" /> : null}

      {/* gradient + نص */}
      <div className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
      <span className="absolute inset-x-1 bottom-1 line-clamp-2 text-center text-[10px] font-bold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
        {category.name}
      </span>
    </Link>
  );
}
