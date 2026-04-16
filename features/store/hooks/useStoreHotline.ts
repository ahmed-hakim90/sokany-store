"use client";

import { useQuery } from "@tanstack/react-query";
import { getStoreHotline } from "@/features/store/services/getStoreHotline";
import { STALE_TIME } from "@/lib/constants";

export function useStoreHotline() {
  return useQuery({
    queryKey: ["store", "hotline"],
    queryFn: getStoreHotline,
    staleTime: STALE_TIME.LONG,
  });
}
