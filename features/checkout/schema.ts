import { z } from "zod";
import { findEgyptGovernorate } from "@/features/checkout/data/egypt-governorates";
import { normalizeEgyptPhoneToE164 } from "@/lib/phone";

const optionalEmail = z.union([
  z.literal(""),
  z.string().email("Invalid email"),
]);

export const checkoutSchema = z
  .object({
    contactFirstName: z.string().min(1, "Required"),
    contactLastName: z.string().min(1, "Required"),
    contactEmail: optionalEmail,
    contactPhone: z.string().min(6, "Required"),
    contactPhoneAlt: z.string(),
    shippingFirstName: z.string(),
    shippingLastName: z.string(),
    shippingAddress1: z.string().min(1, "Required"),
    shippingAddress2: z.string(),
    shippingCity: z.string(),
    shippingState: z.string().min(1, "Required"),
    shippingStateCode: z.string().min(1, "اختاري المحافظة من القائمة"),
    shippingPostcode: z.string(),
    shippingCountry: z.string().min(2, "Required"),
    shippingMethod: z.enum(["flat_rate", "local_pickup", "free_shipping"]),
    paymentMethod: z.enum(["cod", "card"]),
    customerNote: z.string().max(500, "الملاحظة لا تتجاوز 500 حرفاً"),
    shipToDifferentAddress: z.boolean(),
    createAccount: z.boolean(),
    accountPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    const governorate = findEgyptGovernorate(data.shippingStateCode);
    if (!governorate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "اختاري المحافظة من القائمة",
        path: ["shippingStateCode"],
      });
      return;
    }
    if (governorate.nameAr !== data.shippingState) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "اختاري المحافظة من القائمة",
        path: ["shippingState"],
      });
    }
  })
  .superRefine((data, ctx) => {
    if (data.shipToDifferentAddress) {
      if (!data.shippingFirstName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required",
          path: ["shippingFirstName"],
        });
      }
      if (!data.shippingLastName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Required",
          path: ["shippingLastName"],
        });
      }
    }
  })
  .superRefine((data, ctx) => {
    if (!normalizeEgyptPhoneToE164(data.contactPhone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "رقم موبايل مصري غير صالح (مثال: 01xxxxxxxxx أو +201xxxxxxxxx)",
        path: ["contactPhone"],
      });
    }
  });

export type CheckoutSchema = z.infer<typeof checkoutSchema>;
