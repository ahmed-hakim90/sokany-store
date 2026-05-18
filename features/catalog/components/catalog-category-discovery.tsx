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
                "flex w-[6.75rem] shrink-0 snap-start flex-col items-center justify-center rounded-2xl border bg-white px-2 py-4 text-center shadow-sm transition-colors",
                allProductsActive
                  ? "border-brand-950 bg-brand-950 text-accent"
                  : "border-border/70 text-brand-950 hover:bg-surface-muted/40",
              )}
              onMouseEnter={() =>
                void prefetchProducts({ page: 1, per_page: DEFAULT_PER_PAGE })
              }
            >
              <span className="text-[11px] font-bold">كل المنتجات</span>
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
