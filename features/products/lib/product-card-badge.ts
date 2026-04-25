import type { Product } from "@/features/products/types";

/** Days after creation to show «جديد» when not driven by tags */
export const PRODUCT_CARD_NEW_DAYS = 30;
/** Minimum lifetime sales to show «الأكثر مبيعاً» when not driven by tags */
export const PRODUCT_CARD_BESTSELLER_MIN_SALES = 45;

export type ProductCardBadgeKind = "new" | "bestseller";

export type ProductCardBadge = {
  kind: ProductCardBadgeKind;
  label: string;
};

function normalizeTag(s: string): string {
  return s.trim().toLowerCase();
}

function tagIndicatesNew(slug: string, name: string): boolean {
  const s = normalizeTag(slug);
  const n = normalizeTag(name);
  return (
    s === "new" ||
    s === "new-arrival" ||
    s === "new-arrivals" ||
    n === "جديد" ||
    n.includes("new")
  );
}

function tagIndicatesBestseller(slug: string, name: string): boolean {
  const s = normalizeTag(slug);
  const n = normalizeTag(name);
  return (
    s === "bestseller" ||
    s === "best-seller" ||
    s === "best_seller" ||
    s === "top-sales" ||
    s === "الاكثر-مبيعا" ||
    n.includes("bestseller") ||
    n.includes("الأكثر مبيع") ||
    n.includes("الاكثر مبيع")
  );
}

function isWithinNewWindow(dateCreatedIso: string, nowMs: number): boolean {
  const t = Date.parse(dateCreatedIso);
  if (!Number.isFinite(t)) return false;
  const ageMs = nowMs - t;
  if (ageMs < 0) return false;
  return ageMs < PRODUCT_CARD_NEW_DAYS * 24 * 60 * 60 * 1000;
}

/**
 * One badge under the product title: «جديد» takes precedence over «الأكثر مبيعاً»
 * when both tag-based rules apply; then date; then sales threshold.
 */
export function getProductCardBadge(
  product: Product,
  nowMs: number = Date.now(),
): ProductCardBadge | null {
  let tagNew = false;
  let tagBestseller = false;
  for (const t of product.tags) {
    if (tagIndicatesNew(t.slug, t.name)) tagNew = true;
    if (tagIndicatesBestseller(t.slug, t.name)) tagBestseller = true;
  }

  if (tagNew) {
    return { kind: "new", label: "جديد" };
  }
  if (tagBestseller) {
    return { kind: "bestseller", label: "الأكثر مبيعاً" };
  }

  if (isWithinNewWindow(product.dateCreated, nowMs)) {
    return { kind: "new", label: "جديد" };
  }

  if (product.totalSales >= PRODUCT_CARD_BESTSELLER_MIN_SALES) {
    return { kind: "bestseller", label: "الأكثر مبيعاً" };
  }

  return null;
}
