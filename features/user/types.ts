export type BillingAddress = {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
};

export type ShippingAddress = Omit<BillingAddress, "email" | "phone">;

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string;
  billing: BillingAddress;
  shipping: ShippingAddress;
};

export type WCBilling = {
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

export type WCShipping = {
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

export type WCUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url?: string;
  billing: WCBilling;
  shipping: WCShipping;
};
