/**
 * مواضيع Webhooks في WooCommerce تُنشأ/تُفحص من لوحة التحكم.
 * ربطها بـ ‎`revalidateAfterWooCommerceWebhook`‎ في ‎`revalidate-after-product-webhook.ts`‎.
 */
export const SOKANY_WOO_WEBHOOK_RECIPES: {
  topic: string;
  name: string;
  labelAr: string;
}[] = [
  { topic: "product.created", name: "Sokany Next — product.created", labelAr: "منتج جديد" },
  {
    topic: "product.updated",
    name: "Sokany Next — product.updated",
    labelAr: "تعديل منتج (سعر/صور/مخزون)",
  },
  { topic: "product.deleted", name: "Sokany Next — product.deleted", labelAr: "حذف دائم" },
  { topic: "product.restored", name: "Sokany Next — product.restored", labelAr: "استرجاع" },
  { topic: "product.trashed", name: "Sokany Next — product.trashed", labelAr: "نقل لسلة المهملات" },
  {
    topic: "product_cat.created",
    name: "Sokany Next — product_cat.created",
    labelAr: "تصنيف جديد",
  },
  {
    topic: "product_cat.updated",
    name: "Sokany Next — product_cat.updated",
    labelAr: "تعديل تصنيف",
  },
  {
    topic: "product_cat.deleted",
    name: "Sokany Next — product_cat.deleted",
    labelAr: "حذف تصنيف",
  },
  {
    topic: "order.status_changed",
    name: "Sokany Next — order.status_changed",
    labelAr: "تغيير حالة طلب",
  },
  {
    topic: "order.created",
    name: "Sokany Next — order.created",
    labelAr: "طلب جديد (اختياري)",
  },
];
