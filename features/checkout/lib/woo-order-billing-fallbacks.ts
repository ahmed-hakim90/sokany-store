import { normalizeArabicIndicDigitsToAscii } from "@/lib/phone";

/**
 * WooCommerce يفرض غالباً بريداً صالحاً في billing؛ النموذج يسمح ببريد فارغ لطلب الضيف.
 * نولّد بريداً ثابتاً يمرّ تحقق WP عند غياب البريد (لا يُستخدم للمراسلة الفعلية).
 */
export function billingEmailForWoo(contactEmail: string, contactPhone: string): string {
  const trimmed = contactEmail.trim();
  if (trimmed.length > 0 && trimmed.includes("@")) {
    return trimmed;
  }
  const digits = normalizeArabicIndicDigitsToAscii(contactPhone).replace(/\D/g, "").slice(-12);
  const safe = digits.length >= 8 ? digits : `guest${Date.now().toString(36)}`;
  return `guest.${safe}@example.com`;
}

/** المدينة مطلوبة في كثير من إعدادات Woo؛ المنطقة اختيارية في الواجهة — نستخدم المحافظة كنص احتياطي. */
export function cityLineForWoo(shippingCity: string, shippingState: string): string {
  const city = shippingCity.trim();
  if (city.length > 0) return city;
  const state = shippingState.trim();
  if (state.length > 0) return state;
  return "-";
}
