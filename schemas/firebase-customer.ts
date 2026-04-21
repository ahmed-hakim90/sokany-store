import { z } from "zod";

/** Document shape for `storefront_customers/{firebaseAuthUid}` — shipping + contact after phone verification. */
export const firestoreCustomerSchema = z.object({
  contactFirstName: z.string().min(1),
  contactLastName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(6),
  shippingFirstName: z.string().min(1),
  shippingLastName: z.string().min(1),
  shippingAddress1: z.string().min(1),
  shippingAddress2: z.string(),
  shippingCity: z.string().min(1),
  shippingState: z.string().min(1),
  shippingPostcode: z.string().min(1),
  shippingCountry: z.string().min(2),
  shippingMethod: z.enum(["flat_rate", "local_pickup", "free_shipping"]),
  paymentMethod: z.enum(["cod", "card"]),
  phoneE164: z.string().startsWith("+"),
  authPhone: z.string().optional(),
  updatedAt: z.unknown().optional(),
});

export type FirestoreCustomer = z.infer<typeof firestoreCustomerSchema>;
