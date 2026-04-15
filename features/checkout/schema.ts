import { z } from "zod";

export const checkoutSchema = z.object({
  billingFirstName: z.string().min(1, "Required"),
  billingLastName: z.string().min(1, "Required"),
  billingEmail: z.string().email("Invalid email"),
  billingPhone: z.string().min(6, "Required"),
  billingAddress1: z.string().min(1, "Required"),
  billingAddress2: z.string(),
  billingCity: z.string().min(1, "Required"),
  billingState: z.string().min(1, "Required"),
  billingPostcode: z.string().min(1, "Required"),
  billingCountry: z.string().min(2, "Required"),
  shippingFirstName: z.string().min(1, "Required"),
  shippingLastName: z.string().min(1, "Required"),
  shippingAddress1: z.string().min(1, "Required"),
  shippingAddress2: z.string(),
  shippingCity: z.string().min(1, "Required"),
  shippingState: z.string().min(1, "Required"),
  shippingPostcode: z.string().min(1, "Required"),
  shippingCountry: z.string().min(2, "Required"),
  shippingMethod: z.enum(["flat_rate", "local_pickup", "free_shipping"]),
  paymentMethod: z.enum(["cod", "card"]),
  customerNote: z.string(),
});

export type CheckoutSchema = z.infer<typeof checkoutSchema>;
