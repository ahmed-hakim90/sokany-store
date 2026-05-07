import type { CategoryQueryParams, ProductQueryParams } from "@/types";

/** يطابق مفتاح ‎`useCategories`‎ على الصفحة الرئيسية و‎`setQueryData`‎ في ‎`app/(storefront)/page.tsx`‎. */
export const HOME_CATEGORIES_QUERY_PARAMS = {
  per_page: 100,
} as const satisfies CategoryQueryParams;

/** يجب أن تطابق مفاتيح TanStack في الصفحة الرئيسية و‎`page.tsx`‎ (RSC). */
export const HOME_FLASH_SALE_PRODUCT_PARAMS = {
  on_sale: true,
  per_page: 12,
  orderby: "date",
  order: "desc",
} as const satisfies ProductQueryParams;

export const HOME_NEW_ARRIVALS_PRODUCT_PARAMS = {
  per_page: 12,
  orderby: "date",
  order: "desc",
} as const satisfies ProductQueryParams;

export const HOME_BESTSELLERS_PRODUCT_PARAMS = {
  per_page: 12,
  orderby: "popularity",
  order: "desc",
} as const satisfies ProductQueryParams;

export function homeParentCategoryRailParams(
  categoryId: number,
): ProductQueryParams {
  return {
    category: categoryId,
    include_children: true,
    per_page: 12,
    orderby: "popularity",
    order: "desc",
  };
}

export function homeCustomSectionProductParams(
  categoryId: number,
  productCount: number,
): ProductQueryParams {
  return {
    category: categoryId,
    include_children: true,
    per_page: productCount,
    orderby: "popularity",
    order: "desc",
  };
}
