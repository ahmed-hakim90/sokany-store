"use client";

import { startTransition, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { useCart } from "@/hooks/useCart";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { ProductQueryParams } from "@/types";

function parseNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function useProductsCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addProduct } = useCart();

  const params = useMemo<ProductQueryParams>(() => {
    const searchRaw = searchParams.get("search");
    const search =
      searchRaw && searchRaw.trim().length > 0 ? searchRaw.trim() : undefined;

    return {
      page: parseNumber(searchParams.get("page")) ?? 1,
      per_page: parseNumber(searchParams.get("per_page")) ?? 12,
      category: parseNumber(searchParams.get("category")),
      featured:
        searchParams.get("featured") === "true" ? true : undefined,
      search,
    };
  }, [searchParams]);

  const productsQuery = useProducts(params);
  const categoriesQuery = useCategories();

  const isFeatured = searchParams.get("featured") === "true";
  const activeCategoryId = parseNumber(searchParams.get("category"));
  const allActive = !isFeatured && !activeCategoryId;

  const pushFilters = useCallback(
    (next: { featured?: boolean; category?: number | null; clear?: boolean }) => {
      if (next.clear) {
        startTransition(() => {
          router.push(ROUTES.PRODUCTS, { scroll: false });
        });
        return;
      }

      const params = new URLSearchParams();
      const currentSearch = searchParams.get("search");

      if (currentSearch && currentSearch.trim()) {
        params.set("search", currentSearch.trim());
      }
      if (next.featured) {
        params.set("featured", "true");
      }
      if (next.category) {
        params.set("category", String(next.category));
      }

      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${ROUTES.PRODUCTS}?${qs}` : ROUTES.PRODUCTS, {
          scroll: false,
        });
      });
    },
    [router, searchParams],
  );

  return {
    productsQuery,
    categoriesQuery,
    isFeatured,
    activeCategoryId,
    allActive,
    pushFilters,
    addProductToCart: addProduct,
  };
}
