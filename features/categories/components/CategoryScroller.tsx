import Link from "next/link";
import { AppImage } from "@/components/AppImage";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/categories/types";
import { CategoryCard } from "@/features/categories/components/CategoryCard";

export type CategoryScrollerProps = {
  categories: Category[];
  compact?: boolean;
  className?: string;
};

export function CategoryScroller({
  categories,
  compact,
  className,
}: CategoryScrollerProps) {
  if (categories.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="تصفح التصنيفات"
      className={cn(
        "flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {categories.map((category) =>
        compact ? (
          <CompactCategoryTile key={category.id} category={category} />
        ) : (
          <div
            key={category.id}
            className="w-[min(280px,72vw)] shrink-0 snap-start sm:w-[240px]"
          >
            <CategoryCard category={category} />
          </div>
        ),
      )}
    </div>
  );
}

function CompactCategoryTile({ category }: { category: Category }) {
  const src = category.image ?? "/images/placeholder.png";
  return (
    <Link
      href={ROUTES.CATEGORY(category.slug)}
      className="shrink-0 snap-start"
    >
      <Card
        variant="surface"
        className="flex w-[100px] flex-col items-center gap-2 p-2 text-center transition hover:border-brand-300 sm:w-[120px]"
      >
        <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-border bg-image-well sm:h-14 sm:w-14">
          <AppImage src={src} alt="" fill sizes="56px" className="object-cover" />
        </div>
        <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-foreground sm:text-xs">
          {category.name}
        </span>
      </Card>
    </Link>
  );
}
