"use client";

import { useQuery } from "@tanstack/react-query";
import { STALE_TIME } from "@/lib/constants";
import { getCategories } from "@/features/categories/services/getCategories";
import type { CategoryQueryParams } from "@/types";

export function useCategories(params?: CategoryQueryParams) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => getCategories(params),
    staleTime: STALE_TIME.MEDIUM,
  });
}
