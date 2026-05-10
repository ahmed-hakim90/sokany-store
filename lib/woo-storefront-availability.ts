/**
 * فلترة «مش متوفر» في واجهة المتجر
 * بالعامية: في الكتالوج بنخفي اللي `stock_status === outofstock`؛ أما `onbackorder` فلسه ظاهر لأنه قابل للبيع بالطلب المسبق.
 *
 * ملاحظات:
 * - ليه مش query param في Woo: REST Woo محدود في التركيبة بين stock statuses؛ بنفلتر بعد الجلب.
 * - شوف كمان: `@/features/products/services/woo-storefront-product-page.ts`
 */
import type { WCProduct } from "@/features/products/types";

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
