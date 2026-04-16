import type { ZodIssue } from "zod";
import type { CheckoutFormData } from "@/features/checkout/types";

const PATH_TO_CHECKOUT_FIELD: Record<string, keyof CheckoutFormData> = {
  "billing.first_name": "contactFirstName",
  "billing.last_name": "contactLastName",
  "billing.email": "contactEmail",
  "billing.phone": "contactPhone",
  "billing.address_1": "shippingAddress1",
  "billing.address_2": "shippingAddress2",
  "billing.city": "shippingCity",
  "billing.state": "shippingState",
  "billing.postcode": "shippingPostcode",
  "billing.country": "shippingCountry",
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
