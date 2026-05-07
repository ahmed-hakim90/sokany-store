"use client";

import { useQueries } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getProducts } from "@/features/products/services/getProducts";
import { homeCustomSectionProductParams } from "@/features/home/lib/home-page-product-params";
import type { CmsHomeProductSection } from "@/schemas/cms";

/**
 * جلب منتجات كل قسم مخصص على الهوم — استعلام مستقل لكل قسم (شائعية + أحفاد التصنيف).
 * يُمرَّر فقط الأقسام التي سيُعرضها المكوّن الأب (نشطة + تصنيف موجود في القائمة).
 */
export function useHomeCustomProductSectionQueries(sections: CmsHomeProductSection[]) {
  return useQueries({
    queries: sections.map((s) => {
      const params = homeCustomSectionProductParams(s.categoryId, s.productCount);
      return {
        queryKey: ["products", params] as const,
        queryFn: () => getProducts(params),
        staleTime: STALE_TIME.MEDIUM,
      };
    }),
  });
}
