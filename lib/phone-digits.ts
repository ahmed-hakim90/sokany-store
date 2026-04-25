const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EXT_ARABIC_INDIC = "۰۱۲۳۴۵۶۷۸۹";

function toLatinDigitChar(ch: string): string | null {
  if (ch >= "0" && ch <= "9") return ch;
  const i = ARABIC_INDIC.indexOf(ch);
  if (i >= 0) return String(i);
  const j = EXT_ARABIC_INDIC.indexOf(ch);
  if (j >= 0) return String(j);
  return null;
}

/** أرقام لاتينية فقط من أي مدخل (هاتف أو طلب). */
export function normalizeDigits(value: string): string {
  let out = "";
  for (const ch of value) {
    const d = toLatinDigitChar(ch);
    if (d) out += d;
  }
  return out;
}
