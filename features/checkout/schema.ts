import { z } from "zod";

export const checkoutSchema = z
  .object({
    contactFirstName: z.string().min(1, "Required"),
    contactLastName: z.string().min(1, "Required"),
    contactEmail: z.string().email("Invalid email"),
    contactPhone: z.string().min(6, "Required"),
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
    createAccount: z.boolean(),
    accountPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.createAccount && data.accountPassword.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "كلمة السر يجب ألا تقل عن 8 أحرف",
        path: ["accountPassword"],
      });
    }
  });

export type CheckoutSchema = z.infer<typeof checkoutSchema>;
