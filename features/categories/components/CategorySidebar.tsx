"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/categories/types";
import { usePrefetchProducts } from "@/features/products/hooks/usePrefetchProducts";

function RowMarker({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "mt-[0.35rem] h-1.5 w-1.5 shrink-0 rounded-full border transition-colors",
        active
          ? "border-accent bg-accent"
          : "border-muted-foreground/25 bg-transparent group-hover:border-muted-foreground/45",
      )}
      aria-hidden
    />
  );
}

export type CategorySidebarProps = {
  categories: Category[];
  /** Highlights the active category slug on category pages. */
  activeSlug?: string | null;
  className?: string;
  /** Optional slot below the list (e.g. price filter). */
  footerSlot?: ReactNode;
  /**
   * `slug`: links to `/categories/...` (default).
   * `productsQuery`: links to `/products?category=id` for catalog filtering.
   */
  linkMode?: "slug" | "productsQuery";
  /** When `linkMode` is `productsQuery`, highlights the active category id. */
  activeCategoryId?: number | null;
  /** When `linkMode` is `productsQuery`, true when no category filter is applied. */
  allProductsActive?: boolean;
};

export function CategorySidebar({
  categories,
  activeSlug,
  className,
  footerSlot,
  linkMode = "slug",
  activeCategoryId,
  allProductsActive = false,
}: CategorySidebarProps) {
  const isProductsMode = linkMode === "productsQuery";
  const prefetchProducts = usePrefetchProducts();
  const prefetchAllProducts = () => {
    if (!isProductsMode) return;
    void prefetchProducts({ page: 1, per_page: 12 });
  };

  const allActive = isProductsMode
    ? allProductsActive
    : !activeSlug;

  return (
    <nav
      className={cn(
        "rounded-editorial border border-border/70 bg-white/90 p-4 shadow-sm backdrop-blur-sm",
        className,
      )}
      aria-label="تصفية التصنيفات"
    >
      <header className="mb-3 border-b border-border/50 pb-2">
        <p className="text-sm font-bold text-foreground">تصفية النتائج</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">اختر التصنيف أو ضيّق السعر</p>
      </header>
      <ul className="divide-y divide-border/40">
        <li className="py-0.5 first:pt-0">
          {isProductsMode ? (
            <Link
              href={ROUTES.PRODUCTS}
              className={cn(
                "group flex items-start gap-2.5 rounded-xl px-2 py-2 transition-colors",
                allActive
                  ? "bg-brand-950 text-accent"
                  : "hover:bg-black/[0.03]",
              )}
              onMouseEnter={prefetchAllProducts}
              onFocus={prefetchAllProducts}
            >
              <RowMarker active={allActive} />
              <span
                className={cn(
                  "min-w-0 flex-1 text-sm leading-snug",
                  allActive
                    ? "font-bold text-current"
                    : "font-medium text-muted-foreground group-hover:text-foreground",
                )}
              >
                الكل
              </span>
            </Link>
          ) : (
            <Link
              href={ROUTES.CATEGORIES}
              scroll={false}
              className={cn(
                "group flex items-start gap-2.5 rounded-xl px-2 py-2 transition-colors",
                allActive
                  ? "bg-brand-950 text-accent"
                  : "hover:bg-black/[0.03]",
              )}
            >
              <RowMarker active={allActive} />
              <span
                className={cn(
                  "min-w-0 flex-1 text-sm leading-snug",
                  allActive
                    ? "font-bold text-current"
                    : "font-medium text-muted-foreground group-hover:text-foreground",
                )}
              >
                كل التصنيفات
              </span>
            </Link>
          )}
        </li>
        {categories.map((category) => {
          const active = isProductsMode
            ? activeCategoryId === category.id
            : activeSlug === category.slug;
          const href = isProductsMode
            ? `${ROUTES.PRODUCTS}?category=${category.id}`
            : ROUTES.CATEGORY(category.slug);

          return (
            <li key={category.id} className="py-0.5">
              <Link
                href={href}
                scroll={false}
                className={cn(
                  "group flex items-start gap-2.5 rounded-xl px-2 py-2 transition-colors",
                  active
                    ? "bg-brand-950 text-accent"
                    : "hover:bg-black/[0.03]",
                )}
                onMouseEnter={
                  isProductsMode
                    ? () => void prefetchProducts({ category: category.id, page: 1, per_page: 12 })
                    : undefined
                }
                onFocus={
                  isProductsMode
                    ? () => void prefetchProducts({ category: category.id, page: 1, per_page: 12 })
                    : undefined
                }
              >
                <RowMarker active={active} />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "line-clamp-2 text-sm leading-snug",
                      active
                        ? "font-bold text-current"
                        : "font-medium text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {category.name}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block text-[11px] font-normal leading-tight",
                      active
                        ? "text-accent/80"
                        : "text-muted-foreground/85",
                    )}
                  >
                    {category.count} منتج
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {footerSlot ? (
        <div className="mt-4 border-t border-border/50 pt-4 text-sm">{footerSlot}</div>
      ) : null}
    </nav>
  );
}
