import "server-only";

import { getProductsListServer } from "@/features/products/services/getProductsServer";
import type { Product } from "@/features/products/types";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import { tokenizeForArabicSearch } from "./arabic-normalize";

const COMPARE_STOP_WORDS = new Set([
  "قارن",
  "مقارنه",
  "فرق",
  "الفرق",
  "بين",
  "و",
  "ولا",
  "ايه",
  "احسن",
  "افضل",
]);

export type ProductCompareResult = {
  products: Product[];
  text: string;
};

async function searchProducts(query: string): Promise<Product[]> {
  const { products } = await getProductsListServer({
    page: 1,
    per_page: 8,
    search: query,
    orderby: "popularity",
    order: "desc",
  });
  return products.filter((product) => product.inStock && product.price > 0);
}

function termsForCompare(question: string): string[] {
  return tokenizeForArabicSearch(question)
    .map((term) => term.replace(/^ال/, ""))
    .filter((term) => term.length >= 3 && !COMPARE_STOP_WORDS.has(term))
    .slice(0, 6);
}

function productSummary(product: Product): string {
  const attrs = product.attributes
    .filter((attribute) => attribute.visible)
    .slice(0, 2)
    .map((attribute) => `${attribute.name}: ${attribute.options.slice(0, 2).join("، ")}`)
    .join("؛ ");
  return `- ${product.name}: ${formatCurrency(product.price)}${product.onSale ? " (عرض)" : ""} - ${attrs || "مواصفات عامة"} - ${ROUTES.PRODUCT(product.id)}`;
}

export async function comparePublicProducts(
  question: string,
): Promise<ProductCompareResult | null> {
  const terms = termsForCompare(question);
  if (terms.length === 0) return null;
  const byId = new Map<number, Product>();
  for (const term of terms) {
    const matches = await searchProducts(term);
    for (const product of matches.slice(0, 2)) {
      byId.set(product.id, product);
    }
    if (byId.size >= 3) break;
  }
  const products = [...byId.values()].slice(0, 3);
  if (products.length < 2) return null;
  const cheapest = [...products].sort((a, b) => a.price - b.price)[0];
  const bestRated = [...products].sort((a, b) => b.rating - a.rating)[0] ?? cheapest;
  return {
    products,
    text: [
      "مقارنة سريعة:",
      ...products.map(productSummary),
      `الترشيح: ${bestRated.id === cheapest.id ? cheapest.name : bestRated.name} لو عايز أفضل قيمة، و${cheapest.name} لو الأولوية للسعر الأقل.`,
    ].join("\n"),
  };
}
