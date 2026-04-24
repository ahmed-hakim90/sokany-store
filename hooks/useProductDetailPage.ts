"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { useCart } from "@/hooks/useCart";
import { useProduct } from "@/features/products/hooks/useProduct";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useReviews } from "@/features/reviews/hooks/useReviews";
import type { Product } from "@/features/products/types";
import type { ProductSpecItem } from "@/features/products/components/ProductSpecsList";
import { appendWooExcessToProductSpecs } from "@/features/products/lib/woo-excess-to-specs";

function buildProductSpecs(product: Product): ProductSpecItem[] {
  const fromAttributes = product.attributes
    .filter((a) => a.visible && !a.variation && a.options.length > 0)
    .sort((a, b) => a.position - b.position)
    .map((a) => ({
      label: a.name,
      value: a.options.join("، "),
    }));

  if (fromAttributes.length > 0) {
    return fromAttributes;
  }

  const rows: ProductSpecItem[] = [
    { label: "رمز المنتج", value: product.sku || "—" },
    { label: "التوفر", value: product.inStock ? "متوفر" : "غير متوفر" },
  ];

  if (product.stockQuantity != null) {
    rows.push({
      label: "الكمية في المخزون",
      value: String(product.stockQuantity),
    });
  }

  if (product.ratingCount > 0) {
    rows.push({
      label: "متوسط التقييم",
      value: `${product.rating.toFixed(1)} من 5 (${product.ratingCount})`,
    });
  }

  return rows;
}

export function useProductDetailPage(id: number) {
  const router = useRouter();
  const { addProduct } = useCart();
  const productQuery = useProduct(id);
  const reviewsQuery = useReviews(id);

  const relatedParams = useMemo(() => {
    const p = productQuery.data;
    if (!p) return { per_page: 6, page: 1 };
    const fromWoo = p.relatedIds.filter((rid) => rid !== p.id).slice(0, 6);
    if (fromWoo.length > 0) {
      return { include: fromWoo.join(","), per_page: 6, page: 1 };
    }
    const categoryId = p.categories[0]?.id;
    if (categoryId) {
      return { category: categoryId, per_page: 6, page: 1 };
    }
    return { per_page: 6, page: 1 };
  }, [productQuery.data]);

  const relatedQuery = useProducts(relatedParams, {
    enabled: Boolean(productQuery.data),
  });

  const relatedProducts = useMemo(() => {
    const products = relatedQuery.data?.items ?? [];
    return products.filter((product) => product.id !== id).slice(0, 6);
  }, [relatedQuery.data, id]);

  const specs = useMemo(() => {
    if (!productQuery.data) {
      return [];
    }
    const base = buildProductSpecs(productQuery.data);
    return appendWooExcessToProductSpecs(productQuery.data, base);
  }, [productQuery.data]);

  return {
    productQuery,
    reviewsQuery,
    relatedQuery,
    relatedProducts,
    specs,
    addProductToCart: addProduct,
    goToProducts() {
      router.push(ROUTES.PRODUCTS);
    },
  };
}
