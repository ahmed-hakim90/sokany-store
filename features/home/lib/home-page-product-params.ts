import type { CategoryQueryParams, ProductQueryParams } from "@/types";

/** حد أعلى لعدد بطاقات السكة الواحدة على الهوم (خفّاف الحمولة والـ HTML). */
export const HOME_RAIL_PER_PAGE = 10 as const;

/**
 * يطابق مفتاح ‎`useCategories`‎ على الصفحة الرئيسية.
 * لا يُجفَّف من RSC — يقلل حمولة الترطيب؛ أسماء التصنيفات للهيرو تُمرَّر من الخادم كـ props.
 */
export const HOME_CATEGORIES_QUERY_PARAMS = {
  per_page: 100,
} as const satisfies CategoryQueryParams;

/** مفاتيح TanStack — سكة المنتجات الوحيدة المُجفَّفة من RSC هي ‎`homeEagerRailParams`‎. */
export const HOME_FLASH_SALE_PRODUCT_PARAMS = {
  on_sale: true,
  per_page: HOME_RAIL_PER_PAGE,
  orderby: "date",
  order: "desc",
} as const satisfies ProductQueryParams;

export const HOME_NEW_ARRIVALS_PRODUCT_PARAMS = {
  per_page: HOME_RAIL_PER_PAGE,
  orderby: "date",
  order: "desc",
} as const satisfies ProductQueryParams;

export const HOME_BESTSELLERS_PRODUCT_PARAMS = {
  per_page: HOME_RAIL_PER_PAGE,
  orderby: "popularity",
  order: "desc",
} as const satisfies ProductQueryParams;

/** سكة المنتجات الوحيدة التي تُحمَّل فوراً (باقي السكك عبر ‎`useNearViewport`‎). */
export function homeEagerRailParams(
  flashSaleSectionEnabled: boolean,
): ProductQueryParams {
  return flashSaleSectionEnabled
    ? { ...HOME_FLASH_SALE_PRODUCT_PARAMS }
    : { ...HOME_BESTSELLERS_PRODUCT_PARAMS };
}

export function homeParentCategoryRailParams(
  categoryId: number,
): ProductQueryParams {
  return {
    category: categoryId,
    include_children: true,
    per_page: HOME_RAIL_PER_PAGE,
    orderby: "popularity",
    order: "desc",
  };
}

export function homeCustomSectionProductParams(
  categoryId: number,
  productCount: number,
): ProductQueryParams {
  const perPage = Math.min(HOME_RAIL_PER_PAGE, Math.max(1, productCount));
  return {
    category: categoryId,
    include_children: true,
    per_page: perPage,
    orderby: "popularity",
    order: "desc",
  };
}
