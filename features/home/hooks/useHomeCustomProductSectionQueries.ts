"use client";

import { useQueries } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getProducts } from "@/features/products/services/getProducts";
import type { CmsHomeProductSection } from "@/schemas/cms";

/**
 * جلب منتجات كل قسم مخصص على الهوم — استعلام مستقل لكل قسم (شائعية + أحفاد التصنيف).
 * يُمرَّر فقط الأقسام التي سيُعرضها المكوّن الأب (نشطة + تصنيف موجود في القائمة).
 */
export function useHomeCustomProductSectionQueries(sections: CmsHomeProductSection[]) {
  return useQueries({
    queries: sections.map((s) => ({
      queryKey: [
        "products",
        {
          category: s.categoryId,
          include_children: true,
          per_page: s.productCount,
          orderby: "popularity",
          order: "desc",
        },
      ] as const,
      queryFn: () =>
        getProducts({
          category: s.categoryId,
          include_children: true,
          per_page: s.productCount,
          orderby: "popularity",
          order: "desc",
        }),
      staleTime: STALE_TIME.MEDIUM,
    })),
  });
}
