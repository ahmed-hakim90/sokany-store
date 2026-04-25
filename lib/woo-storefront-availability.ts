import type { WCProduct } from "@/features/products/types";

/** ‎`outofstock`‎ = غير معروض في الكتالوج/الرابط المباشر — ‎`instock` + ‎`onbackorder`‎ يبقون ظاهرين. */
export function isWcProductOutOfStockOnly(
  raw: Pick<WCProduct, "stock_status">,
): boolean {
  return raw.stock_status === "outofstock";
}

export function filterWcProductsExcludingOutOfStock(
  data: WCProduct[],
): WCProduct[] {
  return data.filter((p) => !isWcProductOutOfStockOnly(p));
}
