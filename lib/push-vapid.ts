/**
 * المفتاح العام لـ Web Push من Firebase (Web Push certificates) عادةً ~٨٧ حرفًا، Base64 URL-safe.
 * ليس Legacy server key ولا API key.
 */
export function isLikelyValidFirebaseVapidPublicKey(key: string): boolean {
  const t = key.trim();
  /** طول تقريبي لـ P-256 SPKI Base64 URL؛ مع هامش + دعم padding `=` أحياناً */
  if (t.length < 70 || t.length > 140) return false;
  return /^[A-Za-z0-9_-]+={0,2}$/.test(t);
}

/** تحذير في التطوير فقط — لا يُستدعى من السيرفر. */
export function warnIfVapidKeyLooksInvalidDev(vapid: string | undefined): void {
  if (process.env.NODE_ENV !== "development") return;
  if (!vapid?.trim()) return;
  if (isLikelyValidFirebaseVapidPublicKey(vapid)) return;
  console.warn(
    "[push] NEXT_PUBLIC_FIREBASE_VAPID_KEY لا يبدو مفتاح VAPID عاماً من Firebase.\n" +
      "المصدر الصحيح: Firebase Console → Project settings → Cloud Messaging → Web Push certificates → Key pair → المفتاح العام.\n" +
      "يجب أن يطابق مشروع NEXT_PUBLIC_FIREBASE_PROJECT_ID، سطر واحد بدون مسافات أو أسطر.",
  );
}

export function messagingErrorIsInvalidVapid(msg: string): boolean {
  return (
    /applicationServerKey/i.test(msg) ||
    /not valid/i.test(msg) ||
    /invalid.*vapid/i.test(msg)
  );
}
