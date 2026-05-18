"use client";

import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { CategoryIcon } from "@/features/categories/category-icon-registry";
import type { CategoryTreeNode } from "@/features/catalog/lib/catalog-category-tree";
import { usePrefetchProducts } from "@/features/products/hooks/usePrefetchProducts";
import { DEFAULT_PER_PAGE, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type CatalogSidebarTreeProps = {
  tree: CategoryTreeNode[];
  activeCategoryId?: number | null;
  allProductsActive?: boolean;
  className?: string;
};

function CategoryThumb({
  category,
  active,
}: {
  category: { slug: string; image: string | null };
  active: boolean;
}) {
  return (
    <span
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border",
        active ? "border-white/25 bg-white/10" : "border-border/70 bg-surface-muted/50",
      )}
      aria-hidden
    >
      {category.image ? (
        <AppImage src={category.image} alt="" fill sizes="36px" className="object-contain p-0.5" />
      ) : (
        <CategoryIcon slug={category.slug} className="h-5 w-5 text-brand-800" />
      )}
    </span>
  );
}

/*
 * شجرة تصنيفات للشريط الجانبي — أب + أبناء مع صورة مصغّرة وعدد.
 */
export function CatalogSidebarTree({
  tree,
  activeCategoryId,
  allProductsActive = false,
  className,
}: CatalogSidebarTreeProps) {
  const prefetchProducts = usePrefetchProducts();

  return (
    <nav className={cn("min-w-0", className)} aria-label="تصفية التصنيفات">
      <ul className="space-y-1">
        <li>
          <Link
            href={ROUTES.PRODUCTS}
            scroll={false}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors",
              allProductsActive
                ? "bg-brand-950 text-accent"
                : "hover:bg-black/[0.03]",
            )}
            onMouseEnter={() =>
              void prefetchProducts({ page: 1, per_page: DEFAULT_PER_PAGE })
            }
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold",
                allProductsActive
                  ? "border-white/20 bg-white/10"
                  : "border-border/70 bg-surface-muted/40 text-brand-800",
              )}
            >
              الكل
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">كل المنتجات</span>
            </span>
          </Link>
        </li>
        {tree.map((parent) => {
          const parentActive = activeCategoryId === parent.id;
          const parentHref = `${ROUTES.PRODUCTS}?category=${parent.id}`;
          return (
            <li key={parent.id} className="space-y-0.5">
              <Link
                href={parentHref}
                scroll={false}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors",
                  parentActive
                    ? "bg-brand-950 text-accent"
                    : "hover:bg-black/[0.03]",
                )}
                onMouseEnter={() =>
                  void prefetchProducts({
                    category: parent.id,
                    page: 1,
                    per_page: DEFAULT_PER_PAGE,
                  })
                }
              >
                <CategoryThumb category={parent} active={parentActive} />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-sm font-bold leading-snug">
                    {parent.name}
                  </span>
                  {parent.count > 0 ? (
                    <span
                      className={cn(
                        "mt-0.5 block text-[11px]",
                        parentActive ? "text-accent/80" : "text-muted-foreground",
                      )}
                    >
                      {parent.count} منتج
                    </span>
                  ) : null}
                </span>
              </Link>
              {parent.children.length > 0 ? (
                <ul className="me-2 space-y-0.5 border-e border-border/50 pe-2">
                  {parent.children.map((child) => {
                    const childActive = activeCategoryId === child.id;
                    return (
                      <li key={child.id}>
                        <Link
                          href={`${ROUTES.PRODUCTS}?category=${child.id}`}
                          scroll={false}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
                            childActive
                              ? "bg-brand-950/90 font-bold text-accent"
                              : "text-muted-foreground hover:bg-black/[0.03] hover:text-foreground",
                          )}
                          onMouseEnter={() =>
                            void prefetchProducts({
                              category: child.id,
                              page: 1,
                              per_page: DEFAULT_PER_PAGE,
                            })
                          }
                        >
                          <span className="line-clamp-2 min-w-0 flex-1">{child.name}</span>
                          {child.count > 0 ? (
                            <span className="shrink-0 tabular-nums opacity-80">
                              {child.count}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
