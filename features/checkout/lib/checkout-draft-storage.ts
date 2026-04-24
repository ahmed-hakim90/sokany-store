import { z } from "zod";
import type { CheckoutFormData } from "@/features/checkout/types";
import { defaultCheckoutFormValues } from "@/features/checkout/lib/checkout-form-defaults";
import { CHECKOUT_DRAFT_STORAGE_KEY } from "@/lib/constants";

const draftSchema = z.object({
  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  shippingFirstName: z.string().optional(),
  shippingLastName: z.string().optional(),
  shippingAddress1: z.string().optional(),
  shippingAddress2: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingPostcode: z.string().optional(),
  shippingCountry: z.string().optional(),
  shippingMethod: z.enum(["flat_rate", "local_pickup", "free_shipping"]).optional(),
  paymentMethod: z.enum(["cod", "card"]).optional(),
  customerNote: z.string().optional(),
  createAccount: z.boolean().optional(),
});

function mergeFromDraft(parsed: z.infer<typeof draftSchema>): CheckoutFormData {
  return {
    ...defaultCheckoutFormValues,
    ...parsed,
    /* لا نعيد تخزين/تحميل كلمة السر — يُدخلها العميل من جديد عند اختيار «إنشاء حساب» */
    accountPassword: "",
  };
}

/**
 * يقرأ مسودة نموذج إتمام الطلب من `localStorage` (إن وُجدت وصالحة) ويُدمجها مع القيم الافتراضية.
 * تُرجع `null` عند عدم وجود بيانات أو تلفها.
 */
export function loadCheckoutDraftFromStorage(): CheckoutFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CHECKOUT_DRAFT_STORAGE_KEY);
    if (raw == null) return null;
    const data: unknown = JSON.parse(raw);
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      return null;
    }
    const out = draftSchema.safeParse(data);
    if (!out.success) return null;
    return mergeFromDraft(out.data);
  } catch {
    return null;
  }
}

/**
 * يحفظ نموذج إتمام الطلب مع استثناء `accountPassword` (لا تُبقى في المتصفح).
 */
export function saveCheckoutDraftToStorage(values: CheckoutFormData): void {
  if (typeof window === "undefined") return;
  try {
    const toStore: CheckoutFormData = { ...values, accountPassword: "" };
    window.localStorage.setItem(
      CHECKOUT_DRAFT_STORAGE_KEY,
      JSON.stringify(toStore),
    );
  } catch {
    /* مساحة تخزين ممتلئة أو وضع خاص — نتجاهل بصمت */
  }
}

export function clearCheckoutDraftFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CHECKOUT_DRAFT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
