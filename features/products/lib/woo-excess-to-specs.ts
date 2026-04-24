import type { Product } from "@/features/products/types";
import type { ProductSpecItem } from "@/features/products/components/ProductSpecsList";

/** Extra spec rows from `Product.wooExcess` (Woo top-level fields outside the core mapper). */
export function appendWooExcessToProductSpecs(
  product: Product,
  base: ProductSpecItem[],
): ProductSpecItem[] {
  const w = product.wooExcess;
  if (!w || Object.keys(w).length === 0) {
    return base;
  }
  const next: ProductSpecItem[] = [...base];
  const weight = w.weight;
  if (typeof weight === "string" && weight.trim() !== "" && weight !== "0") {
    next.push({ label: "الوزن", value: weight });
  }
  const dim = w.dimensions;
  if (dim && typeof dim === "object" && dim !== null) {
    const d = dim as Record<string, unknown>;
    const fmt = (x: unknown) =>
      x == null || String(x).trim() === "" ? "—" : String(x);
    const { length: L, width: Wb, height: H } = d;
    if (
      [L, Wb, H].some(
        (x) =>
          x != null && String(x).trim() !== "" && String(x) !== "0",
      )
    ) {
      next.push({
        label: "الأبعاد (طول × عرض × ارتفاع)",
        value: `${fmt(L)} × ${fmt(Wb)} × ${fmt(H)}`,
      });
    }
  }
  if (Array.isArray(w.upsell_ids) && w.upsell_ids.length > 0) {
    const nums = (w.upsell_ids as unknown[]).filter(
      (x): x is number => typeof x === "number",
    );
    if (nums.length > 0) {
      next.push({
        label: "مقترحات (معرّف وو)",
        value: nums.join("، "),
      });
    }
  }
  if (Array.isArray(w.cross_sell_ids) && w.cross_sell_ids.length > 0) {
    const nums = (w.cross_sell_ids as unknown[]).filter(
      (x): x is number => typeof x === "number",
    );
    if (nums.length > 0) {
      next.push({
        label: "بيع مرتبط (معرّف وو)",
        value: nums.join("، "),
      });
    }
  }
  if (Array.isArray(w.variations) && w.variations.length > 0) {
    next.push({
      label: "تنويعات (عدد في وو)",
      value: String(w.variations.length),
    });
  }
  if (w.type && typeof w.type === "string" && w.type !== "simple") {
    next.push({ label: "نوع المنتج (وو)", value: w.type });
  }
  return next;
}
