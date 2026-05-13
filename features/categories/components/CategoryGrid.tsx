import type { Category } from "@/features/categories/types";
import { CategoryCard } from "@/features/categories/components/CategoryCard";
import { cn } from "@/lib/utils";

export function CategoryGrid({
  categories,
  className,
}: {
  categories: Category[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
