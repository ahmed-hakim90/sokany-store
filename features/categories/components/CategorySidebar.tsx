"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Link } from "next-view-transitions";
import { DEFAULT_PER_PAGE, ROUTES } from "@/lib/constants";
import { CategoryCircleNavLink } from "@/features/categories/components/category-circle-nav-link";
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
    void prefetchProducts({ page: 1, per_page: DEFAULT_PER_PAGE });
  };

  const allActive = isProductsMode ? allProductsActive : !activeSlug;

  const railScrollRef = useRef<HTMLDivElement>(null);
  const activeRailKey = isProductsMode
    ? allProductsActive
      ? "all"
      : String(activeCategoryId ?? "")
    : (activeSlug ?? "");

  useEffect(() => {
    if (variant !== "rail") return;
    const root = railScrollRef.current;
    if (!root) return;
    const activeTile = root.querySelector<HTMLElement>("[data-category-rail-active]");
    if (!activeTile) return;
    activeTile.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [variant, activeRailKey, categories.length]);

  if (variant === "rail") {
    return (
      <nav
        className={cn(
          "w-full min-w-0 border-0 bg-transparent shadow-none",
          className,
        )}
        aria-label="تصفية التصنيفات"
      >
        <div
          ref={railScrollRef}
          className={cn(
            "max-w-full min-w-0 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "snap-x snap-mandatory pb-1",
          )}
        >
          <ul className="flex max-w-full min-w-0 flex-nowrap items-start gap-2 overflow-x-auto overscroll-x-contain px-0 pb-1 pt-2.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2.5 sm:pb-1.5 sm:pt-3 [&::-webkit-scrollbar]:hidden">
            <li
              className="shrink-0 snap-start"
              data-category-rail-active={allActive ? true : undefined}
            >
              {isProductsMode ? (
                <CategoryCircleNavLink
                  href={ROUTES.PRODUCTS}
                  isActive={allActive}
                  ariaLabel="كل المنتجات"
                  imageSrc={null}
                  iconSlug="all"
                  layout="rail"
                  caption="الكل"
                  onMouseEnter={prefetchAllProducts}
                  onFocus={prefetchAllProducts}
                  scroll={false}
                />
              ) : (
                <CategoryCircleNavLink
                  href={ROUTES.CATEGORIES}
                  isActive={allActive}
                  ariaLabel="كل التصنيفات"
                  imageSrc={null}
                  iconSlug="all"
                  layout="rail"
                  caption="كل التصنيفات"
                  scroll={false}
                />
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
                <li
                  key={category.id}
                  className="shrink-0 snap-start"
                  data-category-rail-active={active ? true : undefined}
                >
                  <CategoryCircleNavLink
                    href={href}
                    isActive={active}
                    ariaLabel={category.name}
                    imageSrc={category.image}
                    iconSlug={category.slug}
                    layout="rail"
                    caption={category.name}
                    onMouseEnter={
                      isProductsMode
                        ? () =>
                            void prefetchProducts({
                              category: category.id,
                              page: 1,
                              per_page: DEFAULT_PER_PAGE,
                            })
                        : undefined
                    }
                    onFocus={
                      isProductsMode
                        ? () =>
                            void prefetchProducts({
                              category: category.id,
                              page: 1,
                              per_page: DEFAULT_PER_PAGE,
                            })
                        : undefined
                    }
                    scroll={false}
                  />
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
                    ? () => void prefetchProducts({ category: category.id, page: 1, per_page: DEFAULT_PER_PAGE })
                    : undefined
                }
                onFocus={
                  isProductsMode
                    ? () => void prefetchProducts({ category: category.id, page: 1, per_page: DEFAULT_PER_PAGE })
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
