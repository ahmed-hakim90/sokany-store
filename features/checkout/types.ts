export type ShippingMethod = "flat_rate" | "local_pickup" | "free_shipping";

export type PaymentMethod = "cod" | "card";

export type CheckoutFormData = {
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  shippingFirstName: string;
  shippingLastName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingStateCode: string;
  shippingPostcode: string;
  shippingCountry: string;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  customerNote: string;
  /** اختياري عند الدفع — إنشاء عميل WooCommerce ثم ربط الطلب بـ customer_id */
  createAccount: boolean;
  accountPassword: string;
};
