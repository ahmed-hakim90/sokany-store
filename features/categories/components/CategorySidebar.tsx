"use client";

import type { ReactNode } from "react";
import { Link } from "next-view-transitions";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/categories/types";
import { usePrefetchProducts } from "@/features/products/hooks/usePrefetchProducts";

function RowMarker({ active, compact }: { active: boolean; compact?: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full border transition-colors",
        compact ? "mt-0.5 h-1 w-1" : "mt-[0.35rem] h-1.5 w-1.5",
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
  /** Smaller type and padding for narrow mobile columns (e.g. 1/3 catalog rail). */
  compact?: boolean;
  /**
   * `default`: عمودي (sidebar).
   * `rail`: شريط أفقي بعرض الشاشة مع تمرير أفقي (موبايل/تابلت في صفحات التصنيفات).
   */
  variant?: "default" | "rail";
};

function chipBase(allActiveOrActive: boolean) {
  return cn(
    "group shrink-0 snap-start  border px-3 py-2 text-start transition-colors",
    "max-w-[min(14rem,calc(100vw-3rem))] sm:max-w-[16rem]",
    allActiveOrActive
      ? "border-brand-950 bg-brand-950 text-accent shadow-sm"
      : "border-border/80 bg-white/95 hover:bg-black/[0.03]",
  );
}

export function CategorySidebar({
  categories,
  activeSlug,
  className,
  footerSlot,
  linkMode = "slug",
  activeCategoryId,
  allProductsActive = false,
  compact = false,
  variant = "default",
}: CategorySidebarProps) {
  const isProductsMode = linkMode === "productsQuery";
  const prefetchProducts = usePrefetchProducts();
  const prefetchAllProducts = () => {
    if (!isProductsMode) return;
    void prefetchProducts({ page: 1, per_page: 12 });
  };

  const allActive = isProductsMode ? allProductsActive : !activeSlug;

  if (variant === "rail") {
    return (
      <nav
        className={cn(
          "w-full min-w-0  border border-border/70 bg-white/90 shadow-sm backdrop-blur-sm",
          className,
        )}
        aria-label="تصفية التصنيفات"
      >
        <div
          className={cn(
            "overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "snap-x snap-mandatory pb-1",
          )}
        >
          <ul className="flex flex-nowrap gap-2 px-2 py-2.5">
            <li className="shrink-0 snap-start">
              {isProductsMode ? (
                <Link
                  href={ROUTES.PRODUCTS}
                  className={cn(chipBase(allActive), "flex flex-col gap-0.5")}
                  onMouseEnter={prefetchAllProducts}
                  onFocus={prefetchAllProducts}
                >
                  <span
                    className={cn(
                      "line-clamp-2 text-sm leading-snug",
                      allActive ? "font-bold" : "font-medium text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    الكل
                  </span>
                </Link>
              ) : (
                <Link
                  href={ROUTES.CATEGORIES}
                  scroll={false}
                  className={cn(chipBase(allActive), "flex flex-col gap-0.5")}
                >
                  <span
                    className={cn(
                      "line-clamp-2 text-sm leading-snug",
                      allActive ? "font-bold" : "font-medium text-muted-foreground group-hover:text-foreground",
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
                <li key={category.id} className="shrink-0 snap-start">
                  <Link
                    href={href}
                    scroll={false}
                    className={cn(chipBase(active), "flex flex-col gap-0.5")}
                    onMouseEnter={
                      isProductsMode
                        ? () =>
                            void prefetchProducts({
                              category: category.id,
                              page: 1,
                              per_page: 12,
                            })
                        : undefined
                    }
                    onFocus={
                      isProductsMode
                        ? () =>
                            void prefetchProducts({
                              category: category.id,
                              page: 1,
                              per_page: 12,
                            })
                        : undefined
                    }
                  >
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
                        "text-[10px] leading-tight",
                        active ? "text-accent/85" : "text-muted-foreground/85",
                      )}
                    >
                      {/* {category.count} منتج */}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        {footerSlot ? (
          <div className="border-t border-border/50 px-2 py-2 text-sm">{footerSlot}</div>
        ) : null}
      </nav>
    );
  }

  return (
    <nav
      className={cn(
        "rounded-editorial border border-border/70 bg-white/90 shadow-sm backdrop-blur-sm",
        compact ? "p-2" : "p-4",
        className,
      )}
      aria-label="تصفية التصنيفات"
    >
      <ul className="divide-y divide-border/40">
        <li className="py-0.5 first:pt-0">
          {isProductsMode ? (
            <Link
              href={ROUTES.PRODUCTS}
              className={cn(
                "group flex items-start transition-colors",
                compact
                  ? "gap-1.5 rounded-lg px-1.5 py-1.5"
                  : "gap-2.5 rounded-xl px-2 py-2",
                allActive
                  ? "bg-brand-950 text-accent"
                  : "hover:bg-black/[0.03]",
              )}
              onMouseEnter={prefetchAllProducts}
              onFocus={prefetchAllProducts}
            >
              <RowMarker active={allActive} compact={compact} />
              <span
                className={cn(
                  "min-w-0 flex-1 leading-snug",
                  compact ? "text-[11px]" : "text-sm",
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
                "group flex items-start transition-colors",
                compact
                  ? "gap-1.5 rounded-lg px-1.5 py-1.5"
                  : "gap-2.5 rounded-xl px-2 py-2",
                allActive
                  ? "bg-brand-950 text-accent"
                  : "hover:bg-black/[0.03]",
              )}
            >
              <RowMarker active={allActive} compact={compact} />
              <span
                className={cn(
                  "min-w-0 flex-1 leading-snug",
                  compact ? "text-[11px]" : "text-sm",
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
                  "group flex items-start transition-colors",
                  compact
                    ? "gap-1.5 rounded-lg px-1.5 py-1.5"
                    : "gap-2.5 rounded-xl px-2 py-2",
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
                <RowMarker active={active} compact={compact} />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "line-clamp-2 leading-snug",
                      compact ? "text-[11px]" : "text-sm",
                      active
                        ? "font-bold text-current"
                        : "font-medium text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {category.name}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block font-normal leading-tight",
                      compact ? "text-[9px]" : "text-[11px]",
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
        <div
          className={cn(
            "border-t border-border/50",
            compact ? "mt-2 pt-2 text-[11px]" : "mt-4 pt-4 text-sm",
          )}
        >
          {footerSlot}
        </div>
      ) : null}
    </nav>
  );
}
