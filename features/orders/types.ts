import type { BillingAddress, ShippingAddress } from "@/features/user/types";

export type OrderStatus =
  | "pending"
  | "processing"
  | "on-hold"
  | "completed"
  | "cancelled"
  | "refunded"
  | "failed";

export type OrderItem = {
  id: number;
  productId: number;
  /** ‎0‎ أو غائب = منتج بسيط أو السطر بلا متغير؛ وإلا يساوي ‎`id`‎ صفحة تفاصيل نفس الـ Variation. */
  variationId?: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  image: string;
  /** e.g. `variation_id`, `sku`, `meta_data` from Woo line item (passthrough). */
  wooExcess?: Record<string, unknown>;
};

export type Order = {
  id: number;
  /** WooCommerce display order number; defaults to `id` when Woo omits `number`. */
  orderNumber: string;
  /** Storefront tracking URL for this Woo order id. */
  trackingUrl: string;
  /** WooCommerce `order_key` — proves guest ownership for amend/cancel APIs. */
  orderKey: string;
  status: OrderStatus;
  dateCreated: string;
  total: number;
  subtotal: number;
  totalTax: number;
  shippingTotal: number;
  currency: string;
  items: OrderItem[];
  billing: BillingAddress;
  shipping: ShippingAddress;
  paymentMethod: string;
  paymentMethodTitle: string;
  customerNote: string;
  /** Woo order `meta_data` (order-level). */
  metaData: Array<{ key: string; value: unknown }>;
  /**
   * Unmodelled top-level order fields: `shipping_lines`, `tax_lines`, `coupon_lines`, `fee_lines`, `date_paid`, …
   */
  wooExcess?: Record<string, unknown>;
};

export type WCOrderLineItem = {
  id: number;
  product_id: number;
  variation_id?: number;
  name: string;
  quantity: number;
  price: string;
  total: string;
  image?: { src: string };
};

export type WCOrder = {
  id: number;
  number?: string;
  storefront_tracking_url?: string;
  order_key?: string;
  status: string;
  date_created: string;
  total: string;
  subtotal: string;
  total_tax: string;
  shipping_total: string;
  currency: string;
  line_items: WCOrderLineItem[];
  billing: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  payment_method: string;
  payment_method_title: string;
  customer_note: string;
  /** Woo may omit or send `null`. After `wpOrderSchema` parse, empty array. */
  meta_data?: Array<{ key: string; value: unknown }> | null;
};

export type CreateOrderPayload = {
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: Array<{
    id?: number;
    product_id: number;
    quantity: number;
    variation_id?: number;
  }>;
  shipping_lines?: Array<{
    method_id: string;
    method_title: string;
    total?: string;
  }>;
  payment_method: string;
  payment_method_title: string;
  customer_note: string;
  set_paid?: boolean;
  customer_id?: number;
  /** WooCommerce order meta — e.g. link storefront Firebase user to the order. */
  meta_data?: Array<{ key: string; value: string | number | boolean }>;
};
