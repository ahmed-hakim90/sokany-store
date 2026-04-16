"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/features/products/services/getProducts";
import { STALE_TIME } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";

const SUGGESTIONS_PER_PAGE = 5;

export function useSearchSuggestions(query: string) {
  const trimmed = query.trim();
  const debounced = useDebounce(trimmed, 300);
  const enabled = debounced.length >= 3;

  return useQuery({
    queryKey: ["search-suggestions", debounced],
    queryFn: () =>
      getProducts({ search: debounced, per_page: SUGGESTIONS_PER_PAGE }),
    staleTime: STALE_TIME.SHORT,
    enabled,
  });
}
