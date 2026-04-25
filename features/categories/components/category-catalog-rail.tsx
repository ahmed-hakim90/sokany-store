"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "next-view-transitions";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/features/categories/category-icon-registry";
import { usePrefetchProducts } from "@/features/products/hooks/usePrefetchProducts";
import { DEFAULT_PER_PAGE, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/categories/types";

function AllCategoriesGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1.25" />
      <rect x="14" y="3" width="7" height="7" rx="1.25" />
      <rect x="3" y="14" width="7" height="7" rx="1.25" />
      <rect x="14" y="14" width="7" height="7" rx="1.25" />
    </svg>
  );
}

type RailTileProps = {
  href: string;
  active: boolean;
  label: string;
  children: ReactNode;
  onPrefetch?: () => void;
};

function RailTile({ href, active, label, children, onPrefetch }: RailTileProps) {
  return (
    <Link
      href={href}
      scroll={false}
      data-active={active ? "true" : "false"}
      className="block  shrink-0"
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
    >
      <Card
        variant="surface"
        className={cn(
          "flex flex-col items-center gap-1.5 border border-border/80 bg-[#e8ecf2] p-1.5 text-center text-brand-950 transition-colors",
          active
            ? "border-brand-950 bg-brand-950 text-accent shadow-[0_10px_20px_-12px_rgba(2,6,23,0.7)]"
            : "hover:border-brand-300",
        )}
      >
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-black/[0.06] bg-white text-brand-800 shadow-sm",
            active &&
              "border-white/20 bg-white/10 text-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
          )}
        >
          {children}
        </div>
        <span className="line-clamp-2 px-0.5 text-[9px] font-semibold leading-tight text-current">
          {label}
        </span>
      </Card>
    </Link>
  );
}

export type CategoryCatalogRailProps = {
  categories: Category[];
  className?: string;
} & (
  | {
      linkMode: "productsQuery";
      allProductsActive: boolean;
      activeCategoryId?: number;
    }
  | {
      linkMode: "slug";
      activeSlug: string;
    }
);

export function CategoryCatalogRail(props: CategoryCatalogRailProps) {
  const prefetchProducts = usePrefetchProducts();
  const navRef = useRef<HTMLElement | null>(null);
  const { categories, className } = props;

  const isProducts = props.linkMode === "productsQuery";

  const allActive = isProducts
    ? props.allProductsActive
    : false;
  const activeKey = isProducts
    ? String(props.activeCategoryId ?? "all")
    : props.activeSlug;

  useEffect(() => {
    if (categories.length === 0) return;
    const nav = navRef.current;
    if (!nav) return;
    const activeTile = nav.querySelector<HTMLElement>('[data-active="true"]');
    if (!activeTile) return;
    // Keep the selected category visible after route transitions on mobile rail.
    activeTile.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeKey, categories.length]);

  if (categories.length === 0) return null;

  return (
    <nav
      ref={navRef}
      className={cn(
        "flex w-[4.75rem] shrink-0 flex-col gap-2 overflow-y-auto overscroll-y-contain py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      aria-label="تصفح التصنيفات"
    >
      {isProducts ? (
        <RailTile
          href={ROUTES.PRODUCTS}
          active={allActive}
          label="الكل"
          onPrefetch={() => void prefetchProducts({ page: 1, per_page: DEFAULT_PER_PAGE })}
        >
          <AllCategoriesGlyph className="h-6 w-6" />
        </RailTile>
      ) : (
        <RailTile
          href={ROUTES.CATEGORIES}
          active={props.activeSlug === ""}
          label="كل التصنيفات"
        >
          <AllCategoriesGlyph className="h-6 w-6" />
        </RailTile>
      )}
      {categories.map((category) => {
        const href =
          isProducts
            ? `${ROUTES.PRODUCTS}?category=${category.id}`
            : ROUTES.CATEGORY(category.slug);
        const active = isProducts
          ? props.activeCategoryId === category.id
          : props.activeSlug === category.slug;

        return (
          <RailTile
            key={category.id}
            href={href}
            active={active}
            label={category.name}
            onPrefetch={
              isProducts
                ? () => void prefetchProducts({ category: category.id, page: 1, per_page: DEFAULT_PER_PAGE })
                : undefined
            }
          >
            <CategoryIcon slug={category.slug} className="h-6 w-6" />
          </RailTile>
        );
      })}
    </nav>
  );
}
