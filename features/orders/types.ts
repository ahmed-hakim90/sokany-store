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
  name: string;
  quantity: number;
  price: number;
  total: number;
  image: string;
};

export type Order = {
  id: number;
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
};

export type WCOrderLineItem = {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  price: string;
  total: string;
  image?: { src: string };
};

export type WCOrder = {
  id: number;
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
    product_id: number;
    quantity: number;
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
};
