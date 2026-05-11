import "server-only";

import { getProductsListServer } from "@/features/products/services/getProductsServer";
import type { Product } from "@/features/products/types";
import { normalizeArabicText, tokenizeForArabicSearch } from "./arabic-normalize";
import type { AssistantPageContext } from "@/features/assistant/types";

export type ProductRecommendationResult = {
  products: Product[];
  title: string;
};

type Budget = {
  max?: number;
  min?: number;
  label?: string;
};

const RECOMMENDATION_STOP_WORDS = new Set([
  "رشح",
  "رشحلي",
  "اقترح",
  "انصحني",
  "افضل",
  "احسن",
  "منتج",
  "منتجات",
  "مناسب",
  "عايز",
  "عاوزه",
  "تحت",
  "لحد",
  "ميزانيه",
  "اقتصادي",
]);

function parseBudget(question: string): Budget {
  const normalized = normalizeArabicText(question);
  const numbers = [...normalized.matchAll(/\d+/g)]
    .map((match) => Number.parseInt(match[0] ?? "", 10))
    .filter((value) => Number.isFinite(value) && value > 0);
  if (/\b(تحت|لحد|حدود|اقل من)\b/.test(normalized) && numbers[0]) {
    return { max: numbers[0], label: `تحت ${numbers[0]} جنيه` };
  }
  if (numbers.length >= 2) {
    return {
      min: Math.min(numbers[0], numbers[1]),
      max: Math.max(numbers[0], numbers[1]),
      label: `من ${Math.min(numbers[0], numbers[1])} لـ ${Math.max(numbers[0], numbers[1])} جنيه`,
    };
  }
  if (/\b(اقتصادي|رخيص|موفر)\b/.test(normalized)) {
    return { label: "اختيارات اقتصادية" };
  }
  return {};
}

function searchTermFromQuestion(question: string, pageContext?: AssistantPageContext): string | undefined {
  if (pageContext?.pageType === "category" && pageContext.categorySlug) {
    return pageContext.categorySlug;
  }
  const terms = tokenizeForArabicSearch(question)
    .map((term) => term.replace(/^ال/, "").replace(/^لل/, ""))
    .filter((term) => term.length >= 3 && !RECOMMENDATION_STOP_WORDS.has(term));
  return terms.slice(0, 3).join(" ") || undefined;
}

function scoreProduct(product: Product): number {
  let score = 0;
  if (product.inStock) score += 100;
  if (product.onSale) score += 20;
  score += Math.min(50, product.totalSales / 10);
  score += Math.min(20, product.rating * 4);
  return score;
}

export async function recommendPublicProducts(
  question: string,
  pageContext?: AssistantPageContext,
): Promise<ProductRecommendationResult | null> {
  const budget = parseBudget(question);
  const search = searchTermFromQuestion(question, pageContext);
  const { products } = await getProductsListServer({
    page: 1,
    per_page: 60,
    search,
    orderby: "popularity",
    order: "desc",
    max_price: budget.max,
    min_price: budget.min,
  });

  const filtered = products
    .filter((product) => product.inStock && product.price > 0)
    .filter((product) => (budget.max ? product.price <= budget.max : true))
    .filter((product) => (budget.min ? product.price >= budget.min : true))
    .sort((a, b) => scoreProduct(b) - scoreProduct(a) || a.price - b.price)
    .slice(0, 3);

  if (filtered.length === 0) return null;
  return {
    products: filtered,
    title: budget.label
      ? `أفضل ترشيحات ${budget.label}`
      : "أفضل ترشيحات مناسبة من الكتالوج",
  };
}
