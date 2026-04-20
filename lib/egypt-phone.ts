/** تحويل رقم موبايل مصري محلي (مثل 01xxxxxxxxx) إلى أرقام دولية بدون + لاستخدام wa.me و tel. */
export function egyptLocalMobileToIntlDigits(local: string): string {
  const digits = local.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length >= 10) {
    return `20${digits.slice(1)}`;
  }
  if (digits.startsWith("20")) return digits;
  return digits;
}

export function waMeUrlFromEgyptLocal(local: string): string {
  return `https://wa.me/${egyptLocalMobileToIntlDigits(local)}`;
}

export function telHrefFromEgyptLocal(local: string): string {
  return `tel:+${egyptLocalMobileToIntlDigits(local)}`;
}
