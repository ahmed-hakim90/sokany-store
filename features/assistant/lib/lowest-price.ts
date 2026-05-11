import "server-only";

import { getProductsListServer } from "@/features/products/services/getProductsServer";
import type { Product } from "@/features/products/types";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import { normalizeArabicText, tokenizeForArabicSearch } from "./arabic-normalize";

const LOWEST_PRICE_TERMS = new Set([
  "اقل",
  "ارخص",
  "رخيص",
  "سعر",
  "اسعار",
  "متاح",
  "المتاح",
  "منتج",
  "منتجات",
  "موديل",
  "كام",
  "بكام",
  "ايه",
  "ماهو",
  "ماهي",
]);

export type LowestPriceResult = {
  product: Product;
  queryLabel: string;
  formattedPrice: string;
  url: string;
};

export function isLowestPriceQuestion(question: string): boolean {
  const normalized = normalizeArabicText(question);
  return (
    /(ارخص|رخيص)/.test(normalized) ||
    (/اقل/.test(normalized) && /(سعر|اسعار|ثمن|بكام)/.test(normalized))
  );
}

function normalizeProductToken(token: string): string {
  let next = token.replace(/^لل/, "").replace(/^ال/, "");
  if (next.length > 4 && next.endsWith("ات")) {
    next = next.slice(0, -2);
  }
  return next;
}

function extractProductSearchTerms(question: string): string[] {
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const rawToken of tokenizeForArabicSearch(question)) {
    const token = normalizeProductToken(rawToken);
    if (token.length < 3 || LOWEST_PRICE_TERMS.has(token) || seen.has(token)) {
      continue;
    }
    seen.add(token);
    terms.push(token);
  }
  return terms.slice(0, 4);
}

function productMatchesTerms(product: Product, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const haystack = normalizeArabicText(
    [
      product.name,
      product.sku,
      ...product.categories.map((category) => category.name),
      ...product.tags.map((tag) => tag.name),
      ...product.attributes.flatMap((attribute) => [
        attribute.name,
        ...attribute.options,
      ]),
    ].join(" "),
  );
  return terms.every((term) => haystack.includes(term));
}

async function fetchCandidates(terms: string[]): Promise<Product[]> {
  const searchQueries = terms.length > 0 ? [terms.join(" "), terms[0]] : [undefined];
  const byId = new Map<number, Product>();

  for (const search of searchQueries) {
    const { products } = await getProductsListServer({
      page: 1,
      per_page: 100,
      orderby: "price",
      order: "asc",
      search,
    });
    for (const product of products) {
      byId.set(product.id, product);
    }
  }

  return [...byId.values()];
}

export async function findLowestPricedPublicProduct(
  question: string,
): Promise<LowestPriceResult | null> {
  const terms = extractProductSearchTerms(question);
  const candidates = (await fetchCandidates(terms))
    .filter((product) => product.inStock)
    .filter((product) => product.price > 0)
    .filter((product) => productMatchesTerms(product, terms))
    .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, "ar"));

  const product = candidates[0];
  if (!product) return null;

  return {
    product,
    queryLabel: terms.length > 0 ? terms.join(" ") : "المنتجات",
    formattedPrice: formatCurrency(product.price),
    url: ROUTES.PRODUCT(product.id),
  };
}
