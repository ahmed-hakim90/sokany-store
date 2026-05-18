"use client";

import { Link } from "next-view-transitions";
import { useMemo } from "react";
import { AppImage } from "@/components/AppImage";
import { HomeSectionHeader } from "@/features/home/components/home-section-header";
import { HOME_DISCOVERY_TILES } from "@/features/home/lib/home-discovery-categories";
import type { Category } from "@/features/categories/types";
import { ROUTES } from "@/lib/constants";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

export type HomeCategoryDiscoveryProps = {
  categories?: Category[];
  className?: string;
};

/*
 * اكتشاف التصنيفات:
 * — موبايل: سكة أفقية ببطاقات مرئية.
 * — ديسكتوب (‎`lg`‎): شبكة ‎4×2‎ (أو أقل عند نقص البيانات).
 */
export function HomeCategoryDiscovery({
  categories = [],
  className,
}: HomeCategoryDiscoveryProps) {
  const bySlug = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) {
      map.set(c.slug, c);
    }
    return map;
  }, [categories]);

  const tiles = HOME_DISCOVERY_TILES.map((tile) => {
    const live = bySlug.get(tile.slug);
    const href =
      "hrefOverride" in tile && tile.hrefOverride
        ? tile.hrefOverride
        : live
          ? ROUTES.CATEGORY(live.slug)
          : ROUTES.CATEGORY(tile.slug);
    return {
      key: tile.slug,
      href,
      label: live?.name ?? tile.label,
      image: live?.image ?? tile.fallbackImage,
    };
  });

  return (
    <section
      className={cn("space-y-3 sm:space-y-4", className)}
      aria-labelledby="home-category-discovery-title"
    >
      <HomeSectionHeader
        id="home-category-discovery-title"
        title="تسوق حسب القسم"
        subtitle="اختر الفئة المناسبة لمنزلك"
        viewAllHref={ROUTES.CATEGORIES}
      />
      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
        {tiles.map((tile) => (
          <Link
            key={tile.key}
            href={tile.href}
            className={cn(
              surfacePanelClass,
              "group relative flex w-[7.5rem] shrink-0 flex-col overflow-hidden p-0 transition-[transform,box-shadow] duration-200",
              "hover:-translate-y-0.5 hover:shadow-[var(--surface-elevated-shadow)]",
              "lg:w-auto lg:min-h-[8.5rem]",
            )}
          >
            <div className="relative aspect-[4/3] w-full bg-image-well lg:aspect-[5/3]">
              <AppImage
                src={tile.image}
                alt=""
                fill
                sizes="(max-width: 1023px) 120px, 200px"
                className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            </div>
            <span className="absolute inset-x-0 bottom-0 px-2 pb-2 text-center text-xs font-bold leading-tight text-white sm:text-sm">
              {tile.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
