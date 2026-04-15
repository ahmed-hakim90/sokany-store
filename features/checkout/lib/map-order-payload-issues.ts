import type { ZodIssue } from "zod";
import type { CheckoutFormData } from "@/features/checkout/types";

const PATH_TO_CHECKOUT_FIELD: Record<string, keyof CheckoutFormData> = {
  "billing.first_name": "billingFirstName",
  "billing.last_name": "billingLastName",
  "billing.email": "billingEmail",
  "billing.phone": "billingPhone",
  "billing.address_1": "billingAddress1",
  "billing.address_2": "billingAddress2",
  "billing.city": "billingCity",
  "billing.state": "billingState",
  "billing.postcode": "billingPostcode",
  "billing.country": "billingCountry",
  "shipping.first_name": "shippingFirstName",
  "shipping.last_name": "shippingLastName",
  "shipping.address_1": "shippingAddress1",
  "shipping.address_2": "shippingAddress2",
  "shipping.city": "shippingCity",
  "shipping.state": "shippingState",
  "shipping.postcode": "shippingPostcode",
  "shipping.country": "shippingCountry",
  "payment_method": "paymentMethod",
  "customer_note": "customerNote",
};

export function mapPayloadIssuesToCheckoutFields(
  issues: ZodIssue[],
): Partial<Record<keyof CheckoutFormData, string>> {
  const out: Partial<Record<keyof CheckoutFormData, string>> = {};
  for (const issue of issues) {
    const pathKey = issue.path.join(".");
    const field = PATH_TO_CHECKOUT_FIELD[pathKey];
    if (field) {
      out[field] = issue.message;
    }
  }
  return out;
}
