/**
 * Maps Firebase Auth / common client SDK messages to short Arabic copy for checkout OTP UX.
 */
const AUTH_CODE_AR: Record<string, string> = {
  "invalid-app-credential":
    "تعذر التحقق من التطبيق. راجع إعدادات Firebase والمفتاح والنطاقات المعتمدة.",
  "too-many-requests":
    "تم تجاوز عدد المحاولات. انتظر قليلاً ثم أعد المحاولة، أو استخدم رقم اختبار من لوحة Firebase.",
  "operation-not-allowed":
    "إرسال الرسائل غير مفعّل لهذه المنطقة أو للمشروع. راجع Authentication وSMS region policy.",
  "invalid-phone-number":
    "رقم الهاتف غير صالح أو التنسيق غير مدعوم.",
  "missing-phone-number": "أدخل رقم موبايل صالح.",
  "invalid-verification-code": "رمز التحقق غير صحيح.",
  "invalid-verification-id": "انتهت جلسة التحقق. أغلق النافذة وأعد تأكيد الطلب.",
  "session-expired": "انتهت الجلسة. أعد طلب رمز تحقق جديد.",
  "code-expired": "انتهت صلاحية الرمز. اطلب رمزاً جديداً.",
  "credential-already-in-use": "هذا الرقم مرتبط بحساب آخر.",
  "network-request-failed": "تعذر الاتصال. تحقق من الشبكة وحاول مرة أخرى.",
  "captcha-check-failed": "فشل التحقق الأمني. حدّث الصفحة وحاول مرة أخرى.",
  "quota-exceeded": "تم تجاوز حد الاستخدام. حاول لاحقاً.",
};

export function mapFirebaseAuthLikeError(error: unknown): string {
  const fallback = "حدث خطأ أثناء التحقق. حاول مرة أخرى.";

  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code).replace(
      /^auth\//,
      "",
    );
    if (code === "permission-denied") {
      return "لا صلاحية لحفظ بيانات العميل. راجع قواعد Firestore لمسار storefront_customers.";
    }
    if (AUTH_CODE_AR[code]) {
      return AUTH_CODE_AR[code];
    }
  }

  const raw = error instanceof Error ? error.message : String(error);

  if (/missing or insufficient permissions/i.test(raw)) {
    return "لا صلاحية للوصول. تحقق من قواعد Firestore للمسار المخصص للمتجر.";
  }

  const authMatch = raw.match(/\(auth\/([a-z0-9-]+)\)/i);
  if (authMatch?.[1]) {
    const key = authMatch[1].toLowerCase();
    if (AUTH_CODE_AR[key]) return AUTH_CODE_AR[key];
  }

  if (/Firebase:\s*Error/i.test(raw) || /auth\//i.test(raw)) {
    return fallback;
  }

  return raw.length > 0 && raw.length < 220 ? raw : fallback;
}
