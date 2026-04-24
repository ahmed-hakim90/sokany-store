import type { OrderItem } from "@/features/orders/types";

/** تطابق سطر طلب ووكومرس مع ‎`id`‎ صفحة المنتج (بسيط أو تباين). */
export function wcLineItemMatchesPdpProductId(
  line: { product_id: number; variation_id?: number | null | undefined },
  pdpProductId: number,
): boolean {
  const v = line.variation_id;
  if (v != null && v > 0) {
    return v === pdpProductId;
  }
  return line.product_id === pdpProductId;
}

/** تطابق عنصر ‎`Order`‎ مُوَرَّد مع ‎`id`‎ الـ PDP. */
export function orderItemMatchesPdpProductId(
  item: OrderItem,
  pdpProductId: number,
): boolean {
  const v = item.variationId;
  if (v != null && v > 0) {
    return v === pdpProductId;
  }
  return item.productId === pdpProductId;
}
