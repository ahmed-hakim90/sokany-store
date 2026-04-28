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

function norm(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

/** يُقدَّر هل كان الطلب يستخدم عنوان شحن مختلفاً عن الفوترة (مستلم/عنوان مختلف). */
function inferShipToDifferentAddress(order: Order): boolean {
  const b = order.billing;
  const s = order.shipping;
  const pairs: [string, string][] = [
    [b.firstName, s.firstName],
    [b.lastName, s.lastName],
    [b.address1, s.address1],
    [b.address2, s.address2],
    [b.city, s.city],
    [b.postcode, s.postcode],
    [b.country, s.country],
  ];
  return pairs.some(([x, y]) => norm(x ?? "") !== norm(y ?? ""));
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
    contactPhoneAlt: pickMetaString(order, "alternate_phone"),
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
    shipToDifferentAddress: inferShipToDifferentAddress(order),
    createAccount: false,
    accountPassword: "",
  };
}
