"use client";

import { useEffect, useRef } from "react";
import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { CategoryIcon } from "@/features/categories/category-icon-registry";
import type { FeaturedCategoryTile } from "@/features/categories/content/featured-category-tiles";
import { ROUTES } from "@/lib/constants";
import { categoryTileLinkClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

export type CategoryTilesSize = "default" | "compact";

const sizeStyles: Record<
  CategoryTilesSize,
  {
    itemMinWidth: string;
    imageSizes: string;
    label: string;
    listGap: string;
    icon: string;
  }
> = {
  default: {
    itemMinWidth: "min-w-[6.75rem]",
    imageSizes: "120px",
    label:
      "border-t-2 border-brand-800/15 bg-white px-2 py-2.5 text-center text-xs font-extrabold leading-tight text-brand-950 sm:text-[13px]",
    listGap: "gap-3",
    icon: "h-10 w-10 text-brand-900 sm:h-11 sm:w-11",
  },
  compact: {
    itemMinWidth: "min-w-[5.75rem]",
    imageSizes: "96px",
    label:
      "border-t-2 border-brand-800/15 bg-white px-1.5 py-2 text-center text-[11px] font-extrabold leading-tight text-brand-950 sm:text-xs",
    listGap: "gap-2",
    icon: "h-9 w-9 text-brand-900",
  },
};

export type CategoryTilesLinkMode = "slug" | "productsQuery";

export type CategoryTilesGridProps = {
  tiles: readonly FeaturedCategoryTile[];
  size?: CategoryTilesSize;
  /**
   * `section`: عنوان + شبكة من sm (صفحة من نحن).
   * `scroll-rail`: تمرير أفقي فقط تحت الهيدر (صفحة التصنيفات / الكتالوج).
   */
  layout?: "section" | "scroll-rail";
  /** `slug`: `/categories/...`؛ `productsQuery`: `/products?category=id` عند توفر المعرّف. */
  linkMode?: CategoryTilesLinkMode;
  activeCategoryId?: number | null;
  allProductsActive?: boolean;
  title?: string;
  titleId?: string;
  className?: string;
  listClassName?: string;
};

function categoryTileHref(
  tile: FeaturedCategoryTile,
  linkMode: CategoryTilesLinkMode,
): string {
  if (linkMode === "productsQuery" && tile.categoryId) {
    return `${ROUTES.PRODUCTS}?category=${tile.categoryId}`;
  }
  return ROUTES.CATEGORY(tile.slug);
}

function CategoryTileImage({
  slug,
  label,
  imageSrc,
  imageAlt,
  imageSizes,
  iconClassName,
}: {
  slug: string;
  label: string;
  imageSrc?: string;
  imageAlt?: string;
  imageSizes: string;
  iconClassName: string;
}) {
  if (imageSrc) {
    return (
      <AppImage
        src={imageSrc}
        alt={imageAlt ?? label}
        fill
        sizes={imageSizes}
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    );
  }

  return (
    <CategoryIcon
      slug={slug}
      className={cn(
        "drop-shadow-[0_1px_1.5px_rgba(15,23,42,0.12)]",
        iconClassName,
      )}
    />
  );
}

/*
 * شبكة بلاطات الفئات — صورة مربعة + تسمية (About، التصنيفات، الكتالوج).
 * الصورة من Woo فقط؛ بدون صورة: أيقونة الفئة على خلفية محايدة.
 */
export function CategoryTilesGrid({
  tiles,
  size = "default",
  layout = "section",
  linkMode = "slug",
  activeCategoryId = null,
  allProductsActive = false,
  title = "تسوق حسب الفئة",
  titleId = "category-tiles-title",
  className,
  listClassName,
}: CategoryTilesGridProps) {
  const styles = sizeStyles[size];
  const isRail = layout === "scroll-rail";
  const isProductsMode = linkMode === "productsQuery";
  const scrollRef = useRef<HTMLUListElement>(null);
  const activeKey = isProductsMode
    ? allProductsActive
      ? "all"
      : String(activeCategoryId ?? "")
    : "";

  useEffect(() => {
    if (!isRail || !isProductsMode) return;
    const root = scrollRef.current;
    if (!root) return;
    const activeEl = root.querySelector<HTMLElement>("[data-category-tile-active]");
    activeEl?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeKey, isRail, isProductsMode, tiles.length]);

  const list = (
    <ul
      ref={scrollRef}
      className={cn(
        "flex overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        styles.listGap,
        isRail
          ? cn(
              "max-w-full min-w-0 flex-nowrap snap-x snap-mandatory pt-2.5 sm:pt-3",
              "ps-[max(0.75rem,env(safe-area-inset-left))] pe-[max(0.75rem,env(safe-area-inset-right))]",
            )
          : "sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-8",
        listClassName,
      )}
      aria-label={isRail ? title : undefined}
    >
      {tiles.map((tile) => {
        const { slug, label, imageSrc, imageAlt, categoryId } = tile;
        const active =
          isProductsMode && categoryId != null && activeCategoryId === categoryId;

        return (
          <li
            key={slug}
            className={cn(
              styles.itemMinWidth,
              "shrink-0",
              isRail ? "snap-start" : "sm:min-w-0",
            )}
            data-category-tile-active={active ? true : undefined}
          >
            <Link
              href={categoryTileHref(tile, linkMode)}
              scroll={false}
              className={cn(
                categoryTileLinkClass,
                "group flex flex-col overflow-hidden",
                active && "border-brand-950 ring-2 ring-brand-950/20",
              )}
            >
              <span
                className={cn(
                  "relative flex aspect-square items-center justify-center",
                  imageSrc ? "bg-surface-muted/30" : "bg-surface-muted/50",
                )}
              >
                <CategoryTileImage
                  slug={slug}
                  label={label}
                  imageSrc={imageSrc}
                  imageAlt={imageAlt}
                  imageSizes={styles.imageSizes}
                  iconClassName={styles.icon}
                />
              </span>
              <span className={styles.label}>{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  if (isRail) {
    return (
      <nav className={cn("w-full min-w-0", className)} aria-label={title}>
        {list}
      </nav>
    );
  }

  return (
    <section className={cn("space-y-5", className)} aria-labelledby={titleId}>
      <h2
        id={titleId}
        className="font-display text-2xl font-bold  text-brand-950 sm:text-[1.65rem]"
      >
        {title}
      </h2>
      {list}
    </section>
  );
}
