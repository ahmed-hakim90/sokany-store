import type { CheckoutFormData } from "@/features/checkout/types";

const CHECKOUT_AMEND_SESSION_KEY = "sokany_checkout_amend_v1";
/** لقطة لمرة واحدة — تُستهلك عند فتح صفحة الدفع لتعبئة الحقول ثم تُمسح (يبقى مسار التعديل في المفتاح الآخر). */
const CHECKOUT_AMEND_FORM_PREFILL_KEY = "sokany_checkout_amend_form_v1";
/**
 * نسخة احتياطية في localStorage مربوطة بـ orderId/orderKey — إن فُقدت جلسة التبويب أو تعثّر قراءة sessionStorage
 * لا يزال بإمكان صفحة الدفع استرجاع التعبئة بعد «تعديل الطلب».
 */
const CHECKOUT_AMEND_FORM_PREFILL_BACKUP_KEY = "sokany_checkout_amend_form_backup_v1";

export type CheckoutAmendSession = {
  orderId: number;
  orderKey: string;
};

type PrefillBackup = CheckoutAmendSession & { form: CheckoutFormData };

export function readCheckoutAmendSession(): CheckoutAmendSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_AMEND_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (
      !data ||
      typeof data !== "object" ||
      typeof (data as CheckoutAmendSession).orderId !== "number" ||
      typeof (data as CheckoutAmendSession).orderKey !== "string"
    ) {
      return null;
    }
    return data as CheckoutAmendSession;
  } catch {
    return null;
  }
}

export function writeCheckoutAmendSession(session: CheckoutAmendSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CHECKOUT_AMEND_SESSION_KEY, JSON.stringify(session));
}

export function writeCheckoutAmendFormPrefill(
  session: CheckoutAmendSession,
  form: CheckoutFormData,
) {
  if (typeof window === "undefined") return;
  const jsonForm = JSON.stringify(form);
  window.sessionStorage.setItem(CHECKOUT_AMEND_FORM_PREFILL_KEY, jsonForm);
  try {
    const backup: PrefillBackup = { ...session, form };
    window.localStorage.setItem(CHECKOUT_AMEND_FORM_PREFILL_BACKUP_KEY, JSON.stringify(backup));
  } catch {
    /* مساحة تخزين ممتلئة أو وضع خاص */
  }
}

export function readCheckoutAmendFormPrefill(
  amend: CheckoutAmendSession | null,
): CheckoutFormData | null {
  if (typeof window === "undefined") return null;

  const parseForm = (raw: string | null): CheckoutFormData | null => {
    if (!raw) return null;
    try {
      const data = JSON.parse(raw) as unknown;
      if (!data || typeof data !== "object") return null;
      return data as CheckoutFormData;
    } catch {
      return null;
    }
  };

  const fromSession = parseForm(window.sessionStorage.getItem(CHECKOUT_AMEND_FORM_PREFILL_KEY));
  if (fromSession) return fromSession;

  if (!amend) return null;

  try {
    const rawBackup = window.localStorage.getItem(CHECKOUT_AMEND_FORM_PREFILL_BACKUP_KEY);
    if (!rawBackup) return null;
    const parsed = JSON.parse(rawBackup) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const b = parsed as Partial<PrefillBackup>;
    if (
      typeof b.orderId !== "number" ||
      typeof b.orderKey !== "string" ||
      b.orderId !== amend.orderId ||
      b.orderKey !== amend.orderKey ||
      !b.form ||
      typeof b.form !== "object"
    ) {
      return null;
    }
    return b.form as CheckoutFormData;
  } catch {
    return null;
  }
}

/** بعد تطبيق التعبئة على النموذج — ليعتمد الزائر بعدها على المسودة المحلية ولا يُعاد فرض بيانات الطلب القديمة. */
export function clearCheckoutAmendFormPrefill() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CHECKOUT_AMEND_FORM_PREFILL_KEY);
  try {
    window.localStorage.removeItem(CHECKOUT_AMEND_FORM_PREFILL_BACKUP_KEY);
  } catch {
    /* ignore */
  }
}

export function clearCheckoutAmendSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CHECKOUT_AMEND_SESSION_KEY);
  clearCheckoutAmendFormPrefill();
}
