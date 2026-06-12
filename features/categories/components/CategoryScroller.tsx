import { Link } from "next-view-transitions";
import { Card } from "@/components/ui/card";
import { CategoryIcon } from "@/features/categories/category-icon-registry";
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
  return (
    <Link
      href={ROUTES.CATEGORY(category.slug)}
      className="shrink-0 snap-start"
    >
      <Card
        variant="surface"
        className="flex w-[5.5rem] flex-col overflow-hidden rounded-xl border border-border/70 bg-white text-center shadow-sm transition hover:border-brand-300"
      >
        <div className="flex h-14 w-full shrink-0 items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200/80">
          <CategoryIcon slug={category.slug} className="h-8 w-8" />
        </div>
        <div className="px-1.5 pb-1.5 pt-1">
          <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-brand-950">
            {category.name}
          </span>
        </div>
      </Card>
    </Link>
  );
}
