"use client";

import { useEffect, useRef } from "react";
import { Link } from "next-view-transitions";
import { CategoryVisualCard } from "@/features/categories/components/category-visual-card";
import { CategoryCircleNavLink } from "@/features/categories/components/category-circle-nav-link";
import type { Category } from "@/features/categories/types";
import { usePrefetchProducts } from "@/features/products/hooks/usePrefetchProducts";
import { DEFAULT_PER_PAGE, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type CatalogCategoryDiscoveryProps = {
  categories: Category[];
  activeCategoryId?: number | null;
  allProductsActive?: boolean;
  className?: string;
  /** `visual`: بطاقات بصورة؛ `chip`: دوائر مضغوطة */
  variant?: "visual" | "chip";
};

/*
 * اكتشاف التصنيفات في صفحة المنتجات — سكة أفقية مع تمييز التصنيف النشط.
 */
export function CatalogCategoryDiscovery({
  categories,
  activeCategoryId,
  allProductsActive = false,
  className,
  variant = "visual",
}: CatalogCategoryDiscoveryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefetchProducts = usePrefetchProducts();
  const activeKey = allProductsActive ? "all" : String(activeCategoryId ?? "");

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const activeEl = root.querySelector<HTMLElement>("[data-category-discovery-active]");
    activeEl?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeKey, categories.length, variant]);

  if (categories.length === 0) return null;

  return (
    <nav
      className={cn("min-w-0", className)}
      aria-label="تصفح حسب التصنيف"
    >
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          variant === "visual" ? "snap-x snap-mandatory px-0.5" : "snap-x snap-mandatory",
        )}
      >
        {variant === "chip" ? (
          <ul className="flex flex-nowrap items-start gap-2">
            <li
              className="shrink-0 snap-start"
              data-category-discovery-active={allProductsActive ? true : undefined}
            >
              <CategoryCircleNavLink
                href={ROUTES.PRODUCTS}
                isActive={allProductsActive}
                ariaLabel="كل المنتجات"
                imageSrc={null}
                iconSlug="all"
                layout="rail"
                caption="الكل"
                scroll={false}
                onMouseEnter={() =>
                  void prefetchProducts({ page: 1, per_page: DEFAULT_PER_PAGE })
                }
                onFocus={() =>
                  void prefetchProducts({ page: 1, per_page: DEFAULT_PER_PAGE })
                }
              />
            </li>
            {categories.map((category) => {
              const active = activeCategoryId === category.id;
              return (
                <li
                  key={category.id}
                  className="shrink-0 snap-start"
                  data-category-discovery-active={active ? true : undefined}
                >
                  <CategoryCircleNavLink
                    href={`${ROUTES.PRODUCTS}?category=${category.id}`}
                    isActive={active}
                    ariaLabel={category.name}
                    imageSrc={category.image}
                    iconSlug={category.slug}
                    layout="rail"
                    caption={category.name}
                    scroll={false}
                    onMouseEnter={() =>
                      void prefetchProducts({
                        category: category.id,
                        page: 1,
                        per_page: DEFAULT_PER_PAGE,
                      })
                    }
                    onFocus={() =>
                      void prefetchProducts({
                        category: category.id,
                        page: 1,
                        per_page: DEFAULT_PER_PAGE,
                      })
                    }
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <>
            <Link
              href={ROUTES.PRODUCTS}
              scroll={false}
              data-category-discovery-active={allProductsActive ? true : undefined}
              className={cn(
                "relative flex w-[5.5rem] h-[5.5rem] shrink-0 snap-start overflow-hidden rounded-xl border shadow-sm transition-all duration-200",
                allProductsActive
                  ? "border-brand-500 ring-2 ring-brand-500/30 shadow-md"
                  : "border-border/70 hover:border-brand-400",
              )}
              onMouseEnter={() =>
                void prefetchProducts({ page: 1, per_page: DEFAULT_PER_PAGE })
              }
            >
              <div className="absolute inset-0 bg-gradient-to-b from-brand-200 to-brand-400" />
              {allProductsActive ? <div className="absolute inset-0 bg-brand-500/15 pointer-events-none" /> : null}
              <div className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
              <span className="absolute inset-x-1 bottom-1 line-clamp-2 text-center text-[10px] font-bold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                كل المنتجات
              </span>
            </Link>
            {categories.map((category) => (
              <CategoryVisualCard
                key={category.id}
                category={category}
                active={activeCategoryId === category.id}
                scroll={false}
                onPrefetch={() =>
                  void prefetchProducts({
                    category: category.id,
                    page: 1,
                    per_page: DEFAULT_PER_PAGE,
                  })
                }
              />
            ))}
          </>
        )}
      </div>
    </nav>
  );
}
