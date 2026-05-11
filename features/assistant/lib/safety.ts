const PRIVATE_PATTERNS = [
  /(?:طلب|اوردر|order)\s*(?:رقم|#)?\s*\d{2,}/i,
  /(?:طلبي|طلبى|اوردرى|اوردري|حسابي|حسابى|اكونتي|اكونت|account)/i,
  /(?:رقم\s*(?:الموبايل|التليفون|الهاتف)|phone|mobile)\s*\d{6,}/i,
  /(?:عميل|customer).*(?:بيانات|عنوان|تليفون|هاتف|ايميل|email)/i,
  /(?:بيانات|معلومات).*(?:عميل|زبون|طلب|اوردر|account|customer)/i,
  /(?:\/control|لوحه التحكم|لوحة التحكم|admin|مشرف|ادمن)/i,
  /(?:woo|woocommerce|ووكومرس).*(?:key|secret|مفتاح|سر|سيكرت|consumer)/i,
  /(?:OPENROUTER_API_KEY|WC_CONSUMER|JWT_SECRET|FIREBASE_SERVICE_ACCOUNT)/i,
];

const ABUSE_PATTERNS = [
  /(?:تجاهل|ignore).*(?:التعليمات|instructions|system)/i,
  /(?:system prompt|developer message|رساله النظام|رسالة النظام)/i,
  /(?:اكشف|اظهر|هات|show).*(?:secret|key|token|password|مفتاح|سر|باسورد)/i,
  /(?:hack|exploit|sql injection|xss|اختراق)/i,
];

export function isPrivateOrRestrictedQuestion(text: string): boolean {
  return PRIVATE_PATTERNS.some((pattern) => pattern.test(text));
}

export function isAbusiveQuestion(text: string): boolean {
  return ABUSE_PATTERNS.some((pattern) => pattern.test(text));
}

export const PRIVATE_REFUSAL =
  "آسف، لا أقدر أساعد في بيانات الطلبات أو الحسابات أو لوحة التحكم أو أي مفاتيح خاصة. لتتبع طلبك استخدم صفحة تتبع الطلب، ولبيانات الحساب استخدم صفحة الحساب الرسمية.";

export const ABUSE_REFUSAL =
  "آسف، أقدر أساعدك فقط في معلومات المتجر العامة مثل المنتجات، التصنيفات، الفروع، الموزعين، الضمان وسياسات المتجر.";
