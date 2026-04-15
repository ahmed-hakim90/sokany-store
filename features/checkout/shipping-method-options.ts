import type { CheckoutFormData } from "@/features/checkout/types";

export const SHIPPING_METHOD_OPTIONS: {
  value: CheckoutFormData["shippingMethod"];
  title: string;
  description: string;
}[] = [
  { value: "flat_rate", title: "سعر شحن ثابت", description: "تكلفة شحن موحدة على الطلب." },
  { value: "local_pickup", title: "استلام من الفرع", description: "استلم طلبك من أقرب نقطة." },
  { value: "free_shipping", title: "شحن مجاني", description: "حسب سياسة المتجر." },
];
