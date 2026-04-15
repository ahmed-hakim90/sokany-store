import { parsePrice } from "@/lib/utils";
import { toAbsoluteSiteUrl } from "@/lib/site";
import type { BillingAddress, ShippingAddress } from "@/features/user/types";
import type { Order, OrderItem, OrderStatus, WCOrder } from "@/features/orders/types";

const PLACEHOLDER_PATH = "/images/placeholder.png";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "on-hold",
  "completed",
  "cancelled",
  "refunded",
  "failed",
];

function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

function mapBilling(b: WCOrder["billing"]): BillingAddress {
  return {
    firstName: b.first_name,
    lastName: b.last_name,
    company: b.company,
    address1: b.address_1,
    address2: b.address_2,
    city: b.city,
    state: b.state,
    postcode: b.postcode,
    country: b.country,
    email: b.email,
    phone: b.phone,
  };
}

function mapShipping(s: WCOrder["shipping"]): ShippingAddress {
  return {
    firstName: s.first_name,
    lastName: s.last_name,
    company: s.company,
    address1: s.address_1,
    address2: s.address_2,
    city: s.city,
    state: s.state,
    postcode: s.postcode,
    country: s.country,
  };
}

function mapLineItems(items: WCOrder["line_items"]): OrderItem[] {
  return items.map((li) => ({
    id: li.id,
    productId: li.product_id,
    name: li.name,
    quantity: li.quantity,
    price: parsePrice(li.price),
    total: parsePrice(li.total),
    image: toAbsoluteSiteUrl(li.image?.src ?? PLACEHOLDER_PATH),
  }));
}

export function mapOrder(wc: WCOrder): Order {
  const status = isOrderStatus(wc.status) ? wc.status : "pending";
  return {
    id: wc.id,
    status,
    dateCreated: wc.date_created,
    total: parsePrice(wc.total),
    subtotal: parsePrice(wc.subtotal),
    totalTax: parsePrice(wc.total_tax),
    shippingTotal: parsePrice(wc.shipping_total),
    currency: wc.currency,
    items: mapLineItems(wc.line_items),
    billing: mapBilling(wc.billing),
    shipping: mapShipping(wc.shipping),
    paymentMethod: wc.payment_method,
    paymentMethodTitle: wc.payment_method_title,
    customerNote: wc.customer_note,
  };
}

export function mapOrders(list: WCOrder[]): Order[] {
  return list.map(mapOrder);
}
