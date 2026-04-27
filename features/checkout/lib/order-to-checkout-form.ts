import type { Order } from "@/features/orders/types";
import { findEgyptGovernorate } from "@/features/checkout/data/egypt-governorates";
import { defaultCheckoutFormValues } from "@/features/checkout/lib/checkout-form-defaults";
import type { CheckoutFormData } from "@/features/checkout/types";

function normalizePaymentMethod(raw: string): CheckoutFormData["paymentMethod"] {
  const t = raw?.trim().toLowerCase();
  if (t === "card") return "card";
  return "cod";
}

function pickStr(a: string | undefined, b: string | undefined): string {
  const x = a?.trim() ?? "";
  if (x) return x;
  return b?.trim() ?? "";
}

function pickMetaString(order: Order, key: string): string {
  const entry = order.metaData.find((item) => item.key === key);
  return typeof entry?.value === "string" ? entry.value.trim() : "";
}

/** يملأ حقول نموذج إتمام الطلب من طلب ووكومرس (مسار تعديل الطلب). */
export function orderToCheckoutFormData(order: Order): CheckoutFormData {
  const b = order.billing;
  const s = order.shipping;
  const state = pickStr(s.state, b.state);
  const governorate =
    findEgyptGovernorate(pickMetaString(order, "governorate_code")) ??
    findEgyptGovernorate(pickMetaString(order, "governorate_name")) ??
    findEgyptGovernorate(state);

  return {
    ...defaultCheckoutFormValues,
    contactFirstName: pickStr(b.firstName, s.firstName),
    contactLastName: pickStr(b.lastName, s.lastName),
    contactEmail: b.email?.trim() ?? "",
    contactPhone: b.phone?.trim() ?? "",
    shippingFirstName: pickStr(s.firstName, b.firstName),
    shippingLastName: pickStr(s.lastName, b.lastName),
    shippingAddress1: pickStr(s.address1, b.address1),
    shippingAddress2: pickStr(s.address2, b.address2),
    shippingCity: pickStr(s.city, b.city),
    shippingState: governorate?.nameAr ?? state,
    shippingStateCode: governorate?.code ?? "",
    shippingPostcode: pickStr(s.postcode, b.postcode),
    shippingCountry:
      pickStr(s.country, b.country) || defaultCheckoutFormValues.shippingCountry,
    paymentMethod: normalizePaymentMethod(order.paymentMethod),
    customerNote: order.customerNote ?? "",
    createAccount: false,
    accountPassword: "",
  };
}
