import { CURRENCY_LOCALE, PRODUCT_CARD_MIN_SALES_TO_DISPLAY } from "@/lib/constants";
import type { Product } from "@/features/products/types";

/**
 * نص «عدد المبيعات» في كارت المنتج. يُعاد `null` عند التعطيل من البيئة
 * أو عندما يكون `totalSales` دون العتبة (لا نعرض أرقام صغيرة).
 */
export function getProductCardSalesCountText(
  product: Product,
  showSalesCount: boolean,
): string | null {
  if (!showSalesCount) return null;
  if (product.totalSales < PRODUCT_CARD_MIN_SALES_TO_DISPLAY) return null;
  const n = product.totalSales;
  if (!Number.isFinite(n) || n < 0) return null;
  return `تم بيع( ${n} )مرة`;
}
