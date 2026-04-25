"use client";

import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getCategoryBySlug } from "@/features/categories/services/getCategoryBySlug";

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => getCategoryBySlug(slug),
    staleTime: STALE_TIME.MEDIUM,
    enabled: slug.length > 0,
  });
}
