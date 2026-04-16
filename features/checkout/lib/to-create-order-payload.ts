import type { CartItem } from "@/features/cart/types";
import { SHIPPING_METHOD_OPTIONS } from "@/features/checkout/shipping-method-options";
import type { CheckoutFormData } from "@/features/checkout/types";
import type { CreateOrderPayload } from "@/features/orders/types";

const SHIPPING_METHOD_LABELS: Record<CheckoutFormData["shippingMethod"], string> = {
  flat_rate: "سعر شحن ثابت",
  local_pickup: "استلام من الفرع",
  free_shipping: "شحن مجاني",
};

const PAYMENT_METHOD_LABELS: Record<CheckoutFormData["paymentMethod"], string> = {
  cod: "الدفع عند الاستلام",
  card: "بطاقة (تجريبي)",
};

function shippingFeeFor(method: CheckoutFormData["shippingMethod"]): number {
  if (method === "flat_rate") return 49;
  return 0;
}

export function shippingFeeForMethod(method: CheckoutFormData["shippingMethod"]): number {
  return shippingFeeFor(method);
}

export function shippingMethodTitleFor(values: CheckoutFormData): string | undefined {
  return SHIPPING_METHOD_OPTIONS.find((o) => o.value === values.shippingMethod)?.title;
}

export function toCreateOrderPayload(
  values: CheckoutFormData,
  items: CartItem[],
): CreateOrderPayload {
  const shipping = {
    first_name: values.shippingFirstName,
    last_name: values.shippingLastName,
    address_1: values.shippingAddress1,
    address_2: values.shippingAddress2,
    city: values.shippingCity,
    state: values.shippingState,
    postcode: values.shippingPostcode,
    country: values.shippingCountry,
  } as const;

  return {
    billing: {
      ...shipping,
      first_name: values.contactFirstName || shipping.first_name,
      last_name: values.contactLastName || shipping.last_name,
      email: values.contactEmail,
      phone: values.contactPhone,
    },
    shipping,
    line_items: items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
    shipping_lines: [
      {
        method_id: values.shippingMethod,
        method_title: SHIPPING_METHOD_LABELS[values.shippingMethod],
        total: String(shippingFeeFor(values.shippingMethod)),
      },
    ],
    payment_method: values.paymentMethod,
    payment_method_title: PAYMENT_METHOD_LABELS[values.paymentMethod],
    customer_note: values.customerNote,
    set_paid: false,
  };
}
