import type { CartItem } from "@/features/cart/types";
import type { CheckoutFormData } from "@/features/checkout/types";
import type { CreateOrderPayload } from "@/features/orders/types";

const PAYMENT_METHOD_LABELS: Record<CheckoutFormData["paymentMethod"], string> = {
  cod: "الدفع عند الاستلام",
  card: "بطاقة (تجريبي)",
};

/** Shown in checkout/cart; Woo order line for storefront — no user-selectable method. */
export const CHECKOUT_SHIPPING_DISPLAY_LABEL = "شحن مجاني";

const CHECKOUT_WOO_SHIPPING = {
  method_id: "free_shipping" as const,
  method_title: CHECKOUT_SHIPPING_DISPLAY_LABEL,
  total: "0",
};

export function shippingFeeForMethod(_method: CheckoutFormData["shippingMethod"]): number {
  return 0;
}

export function toCreateOrderPayload(
  values: CheckoutFormData,
  items: CartItem[],
  options?: { customerId?: number; firebaseUid?: string },
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
    shipping_lines: [CHECKOUT_WOO_SHIPPING],
    payment_method: values.paymentMethod,
    payment_method_title: PAYMENT_METHOD_LABELS[values.paymentMethod],
    customer_note: values.customerNote,
    set_paid: false,
    ...(options?.customerId ? { customer_id: options.customerId } : {}),
    ...(options?.firebaseUid
      ? {
          meta_data: [{ key: "firebase_uid", value: options.firebaseUid }],
        }
      : {}),
  };
}
