import type { CartItem } from "@/features/cart/types";
import type { CheckoutFormData } from "@/features/checkout/types";
import type { CreateOrderPayload } from "@/features/orders/types";
import {
  billingEmailForWoo,
  cityLineForWoo,
} from "@/features/checkout/lib/woo-order-billing-fallbacks";

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
  void _method;
  return 0;
}

export function toCreateOrderPayload(
  values: CheckoutFormData,
  items: CartItem[],
  options?: { customerId?: number; firebaseUid?: string },
): CreateOrderPayload {
  const postcode = values.shippingPostcode.trim() || "-";
  const cityLine = cityLineForWoo(values.shippingCity, values.shippingState);
  const billingEmail = billingEmailForWoo(values.contactEmail, values.contactPhone);

  const sharedLines = {
    address_1: values.shippingAddress1,
    address_2: values.shippingAddress2,
    city: cityLine,
    state: values.shippingState,
    postcode,
    country: values.shippingCountry,
  } as const;

  const shippingNames = values.shipToDifferentAddress
    ? {
        first_name: values.shippingFirstName.trim(),
        last_name: values.shippingLastName.trim(),
      }
    : {
        first_name: values.contactFirstName.trim(),
        last_name: values.contactLastName.trim(),
      };

  const metaData: NonNullable<CreateOrderPayload["meta_data"]> = [
    { key: "governorate_code", value: values.shippingStateCode },
    { key: "governorate_name", value: values.shippingState },
    ...(options?.firebaseUid
      ? [{ key: "firebase_uid", value: options.firebaseUid }]
      : []),
    ...(values.contactPhoneAlt.trim()
      ? [{ key: "alternate_phone", value: values.contactPhoneAlt.trim() }]
      : []),
  ];

  return {
    billing: {
      first_name: values.contactFirstName,
      last_name: values.contactLastName,
      ...sharedLines,
      email: billingEmail,
      phone: values.contactPhone,
    },
    shipping: {
      ...shippingNames,
      ...sharedLines,
    },
    line_items: items.map((item) => ({
      ...(item.wooLineItemId != null ? { id: item.wooLineItemId } : {}),
      product_id: item.productId,
      quantity: item.quantity,
      ...(item.variationId != null && item.variationId > 0
        ? { variation_id: item.variationId }
        : {}),
    })),
    shipping_lines: [CHECKOUT_WOO_SHIPPING],
    payment_method: values.paymentMethod,
    payment_method_title: PAYMENT_METHOD_LABELS[values.paymentMethod],
    customer_note: values.customerNote,
    set_paid: false,
    ...(options?.customerId ? { customer_id: options.customerId } : {}),
    meta_data: metaData,
  };
}
