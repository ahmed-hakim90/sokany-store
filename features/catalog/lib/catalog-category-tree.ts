import type { Category } from "@/features/categories/types";

/** تصنيفات المستوى الأعلى (parent = 0). */
export function getTopLevelCategories(categories: Category[]): Category[] {
  return categories.filter((c) => c.parentId === 0);
}

/** أبناء تصنيف مُعيَّن — يُفلتر حسب count>0 عند الطلب. */
export function getChildCategories(
  categories: Category[],
  parentId: number,
  options?: { requireCount?: boolean },
): Category[] {
  const requireCount = options?.requireCount ?? true;
  return categories.filter(
    (c) =>
      c.parentId === parentId && (!requireCount || c.count > 0),
  );
}

export function findCategoryById(
  categories: Category[],
  id: number | null | undefined,
): Category | null {
  if (id == null) return null;
  return categories.find((c) => c.id === id) ?? null;
}

export function findCategoryBySlug(
  categories: Category[],
  slug: string | null | undefined,
): Category | null {
  if (!slug) return null;
  return categories.find((c) => c.slug === slug) ?? null;
}

/**
 * صف التصنيفات الأفقي على الموبايل حسب شجرة Woo:
 * — للأب الذي له أبناء ظاهرون (عدد > 0): `[التصنيف النشط، …أبناؤه]`.
 * — لورقة تحت أب: كل إخوته تحت نفس الأب (يشمل النشط).
 * — لتصنيف مستوى أعلى بلا أبناء: تصنيفات المستوى الأعلى ذات العدد > 0.
 */
export function getCategoryHorizontalNavCategories(
  categories: Category[],
  active: Category,
): Category[] {
  const children = getChildCategories(categories, active.id);
  if (children.length > 0) {
    return [active, ...children];
  }
  if (active.parentId > 0) {
    return getChildCategories(categories, active.parentId);
  }
  return getTopLevelCategories(categories.filter((c) => c.count > 0));
}

export type CategoryTreeNode = Category & { children: CategoryTreeNode[] };

/** شجرة تصنيفات للشريط الجانبي — أباء ثم أبناء مباشرون فقط. */
export function buildCategoryTree(
  categories: Category[],
  options?: { requireCount?: boolean },
): CategoryTreeNode[] {
  const requireCount = options?.requireCount ?? true;
  const visible = requireCount
    ? categories.filter((c) => c.count > 0)
    : categories;
  const tops = visible.filter((c) => c.parentId === 0);
  return tops.map((parent) => ({
    ...parent,
    children: visible
      .filter((c) => c.parentId === parent.id)
      .map((child) => ({ ...child, children: [] })),
  }));
}
