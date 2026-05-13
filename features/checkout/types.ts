import type { Order } from "@/features/orders/types";

export type ShippingMethod = "flat_rate" | "local_pickup" | "free_shipping";

export type PaymentMethod = "cod" | "card" | "fawry" | "paymob";

/** بوابات الدفع الأونلاين التي تحتاج إعادة توجيه بعد إنشاء الطلب */
export const ONLINE_PAYMENT_METHODS: ReadonlySet<PaymentMethod> = new Set([
  "fawry",
  "paymob",
]);

export type CheckoutFormData = {
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  /** هاتف احتياطي — يُمرَّر كـ order meta */
  contactPhoneAlt: string;
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
  /** عنوان الشحن يختلف عن عنوان الفوترة — يُعرض حقول اسم المستلم فقط؛ العنوان يبقى مشتركاً */
  shipToDifferentAddress: boolean;
  /** اختياري عند الدفع — إنشاء عميل WooCommerce ثم ربط الطلب بـ customer_id */
  createAccount: boolean;
  accountPassword: string;
};

export type CheckoutSuccessSnapshot = {
  items: {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    thumbnail: string;
    sku: string;
  }[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingMethodTitle: string;
  paymentMethod: PaymentMethod;
  shipping: {
    name: string;
    phone: string;
    phoneAlt: string;
    email: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postcode: string;
  };
  onlinePayment?: {
    provider: "fawry" | "paymob";
    referenceNumber?: string;
    merchantRefNum?: string;
    instructions?: string;
  };
};

export type OrderConfirmationSessionPayload = {
  order: Order;
  snapshot: CheckoutSuccessSnapshot;
};
