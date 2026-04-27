import type { CheckoutFormData } from "@/features/checkout/types";

export const defaultCheckoutFormValues: CheckoutFormData = {
  contactFirstName: "",
  contactLastName: "",
  contactEmail: "",
  contactPhone: "",
  shippingFirstName: "",
  shippingLastName: "",
  shippingAddress1: "",
  shippingAddress2: "",
  shippingCity: "",
  shippingState: "",
  shippingStateCode: "",
  shippingPostcode: "",
  shippingCountry: "EG",
  shippingMethod: "free_shipping",
  paymentMethod: "cod",
  customerNote: "",
  createAccount: false,
  accountPassword: "",
};
