import type { Category } from "@/features/categories/types";

/** تصنيفات أب بها منتجات — تُستخدم في السكroller الأفقي وقضبان «الأب» في الرئيسية. */
export function parentCategoriesForHome(categories: Category[]): Category[] {
  return [...categories]
    .filter((c) => c.parentId === 0 && c.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "ar"));
}
