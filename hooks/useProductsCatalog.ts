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

function parseNonNegativeInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function useProductsCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addProduct } = useCart();

  const params = useMemo<ProductQueryParams>(() => {
    const searchRaw = searchParams.get("search");
    const search =
      searchRaw && searchRaw.trim().length > 0 ? searchRaw.trim() : undefined;

    const orderbyRaw = searchParams.get("orderby");
    const orderRaw = searchParams.get("order");
    const order =
      orderRaw === "asc" || orderRaw === "desc" ? orderRaw : undefined;

    return {
      page: parseNumber(searchParams.get("page")) ?? 1,
      per_page: parseNumber(searchParams.get("per_page")) ?? 12,
      category: parseNumber(searchParams.get("category")),
      featured:
        searchParams.get("featured") === "true" ? true : undefined,
      search,
      orderby:
        orderbyRaw &&
        ["date", "popularity", "price", "rating", "title"].includes(orderbyRaw)
          ? orderbyRaw
          : undefined,
      order,
      min_price: parseNonNegativeInt(searchParams.get("min_price")),
      max_price: parseNonNegativeInt(searchParams.get("max_price")),
    };
  }, [searchParams]);

  const productsQuery = useProducts(params);
  const categoriesQuery = useCategories();

  const isFeatured = searchParams.get("featured") === "true";
  const activeCategoryId = parseNumber(searchParams.get("category"));
  const allActive = !isFeatured && !activeCategoryId;

  const pushFilters = useCallback(
    (next: {
      featured?: boolean;
      category?: number | null;
      clear?: boolean;
      orderby?: string | null;
      order?: "asc" | "desc" | null;
      min_price?: number | null;
      max_price?: number | null;
    }) => {
      if (next.clear) {
        startTransition(() => {
          router.push(ROUTES.PRODUCTS, { scroll: false });
        });
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (next.featured) {
        params.set("featured", "true");
        params.delete("category");
      }
      if (next.category) {
        params.set("category", String(next.category));
        params.delete("featured");
      }

      if (next.orderby !== undefined) {
        if (next.orderby) {
          params.set("orderby", next.orderby);
          if (next.order === "asc" || next.order === "desc") {
            params.set("order", next.order);
          }
        } else {
          params.delete("orderby");
          params.delete("order");
        }
      } else if (next.order === "asc" || next.order === "desc") {
        params.set("order", next.order);
      }

      if (next.min_price !== undefined) {
        if (next.min_price != null && next.min_price > 0) {
          params.set("min_price", String(next.min_price));
        } else {
          params.delete("min_price");
        }
      }
      if (next.max_price !== undefined) {
        if (next.max_price != null && next.max_price > 0) {
          params.set("max_price", String(next.max_price));
        } else {
          params.delete("max_price");
        }
      }

      params.delete("page");

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
    searchParams,
    catalogParams: params,
  };
}
