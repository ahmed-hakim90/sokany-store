"use client";

import { useQuery } from "@tanstack/react-query";
import { normalizeProductSku, type Product3DModel } from "@/lib/product-3d-map";

type Product3DModelResponse =
  | { model: Product3DModel | null; error?: undefined }
  | { model?: undefined; error: string };

async function fetchProduct3DModel(sku: string): Promise<Product3DModel | null> {
  const params = new URLSearchParams({ sku });
  const response = await fetch(`/api/products/3d-asset?${params.toString()}`);
  const payload = (await response.json()) as Product3DModelResponse;
  if (!response.ok || "error" in payload) {
    throw new Error("error" in payload ? payload.error : "تعذر جلب نموذج 3D");
  }
  return payload.model ?? null;
}

export function useProduct3DModel(sku: string | null | undefined) {
  const normalizedSku = normalizeProductSku(sku);

  return useQuery({
    queryKey: ["product-3d-model", normalizedSku],
    queryFn: () => fetchProduct3DModel(normalizedSku),
    enabled: normalizedSku.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}
