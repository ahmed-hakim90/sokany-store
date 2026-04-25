import type {
  BillingAddress,
  ShippingAddress,
  User,
  WCBilling,
  WCShipping,
  WCUser,
} from "@/features/user/types";

function mapBilling(b: WCBilling): BillingAddress {
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

function mapShipping(s: WCShipping): ShippingAddress {
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

export function mapUser(wc: WCUser): User {
  return {
    id: wc.id,
    email: wc.email,
    firstName: wc.first_name,
    lastName: wc.last_name,
    username: wc.username,
    avatarUrl: wc.avatar_url ?? "",
    billing: mapBilling(wc.billing),
    shipping: mapShipping(wc.shipping),
  };
}
