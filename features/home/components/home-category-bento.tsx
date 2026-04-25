"use client";

import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { CategoryIcon } from "@/features/categories/category-icon-registry";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/categories/types";

function pick(categories: Category[], slug: string) {
  return categories.find((c) => c.slug === slug);
}

function CategoryBentoTile({
  category,
  className,
  minHeightClass,
}: {
  category: Category;
  className?: string;
  minHeightClass?: string;
}) {
  return (
    <Link
      href={ROUTES.CATEGORY(category.slug)}
      className={cn(
        "group relative isolate min-h-0 overflow-hidden rounded-2xl border border-black/[0.06] bg-image-well shadow-sm transition-colors hover:border-brand-950 hover:shadow-md",
        minHeightClass,
        className,
      )}
    >
      {category.image ? (
        <AppImage
          src={category.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 50vw, 28vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
          <CategoryIcon slug={category.slug} className="h-16 w-16 text-zinc-500" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-all duration-300 group-hover:from-black group-hover:via-black/70 group-hover:to-black/20" />
      <p className="absolute inset-x-0 bottom-0 p-4 text-end text-base font-bold leading-snug text-white transition-colors duration-300 group-hover:text-accent sm:p-5 sm:text-lg">
        {category.name}
      </p>
    </Link>
  );
}

export type HomeCategoryBentoProps = {
  categories: Category[];
  className?: string;
};

/**
 * Desktop “bento” category showcase (RTL). Hidden on small screens — pair with
 * `CategoryShortcutGrid` for mobile.
 */
export function HomeCategoryBento({ categories, className }: HomeCategoryBentoProps) {
  const hero = pick(categories, "kitchen-supplies") ?? pick(categories, "home-appliances");
  const a = pick(categories, "personal-care");
  const b = pick(categories, "cloth-iron");
  const wide = pick(categories, "coffee-maker");

  if (!hero || !a || !b || !wide) return null;

  return (
    <section className={cn("min-w-0", className)} aria-labelledby="home-category-bento-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2
          id="home-category-bento-title"
          className="font-display text-lg font-bold tracking-tight text-brand-950 sm:text-xl"
        >
          التصنيفات التقنية
        </h2>
        <Link
          href={ROUTES.CATEGORIES}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground hover:underline"
        >
          جميع الفئات
          <span aria-hidden className="inline-block rtl:rotate-180">
            →
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:min-h-[22rem] md:grid-cols-[minmax(0,1.12fr)_minmax(0,0.44fr)_minmax(0,0.44fr)] md:grid-rows-2 md:gap-4 lg:min-h-[26rem]">
        <CategoryBentoTile
          category={hero}
          minHeightClass="min-h-[11.5rem] md:min-h-0"
          className="col-span-2 md:col-span-1 md:row-span-2"
        />
        <CategoryBentoTile category={a} minHeightClass="min-h-[9rem] md:min-h-0" className="min-h-[9rem]" />
        <CategoryBentoTile category={b} minHeightClass="min-h-[9rem] md:min-h-0" className="min-h-[9rem]" />
        <CategoryBentoTile
          category={wide}
          minHeightClass="min-h-[9rem] md:min-h-0"
          className="col-span-2 md:col-span-2"
        />
      </div>
    </section>
  );
}
