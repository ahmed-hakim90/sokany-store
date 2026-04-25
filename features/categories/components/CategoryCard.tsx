import { Link } from "next-view-transitions";
import { CategoryIcon } from "@/features/categories/category-icon-registry";
import { ROUTES } from "@/lib/constants";
import type { Category } from "@/features/categories/types";
import { cn } from "@/lib/utils";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={ROUTES.CATEGORY(category.slug)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(15,23,42,0.1)]"
    >
      <div
        className={cn(
          "relative flex  items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200/90",
          "aspect-[4/3]",
        )}
      >
        <span className="flex h-[min(44%,7.5rem)] w-[min(44%,7.5rem)] items-center justify-center rounded-2xl border border-white/80 bg-white/95 text-brand-800 shadow-md">
          <CategoryIcon slug={category.slug} className="h-[55%] w-[55%] max-h-20 max-w-20" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-brand-600">
          {category.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {category.count} {category.count === 1 ? "منتج" : "منتجات"}
        </p>
      </div>
    </Link>
  );
}
