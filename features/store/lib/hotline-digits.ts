export const STORE_HOTLINE_FALLBACK = "17355";

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

/** Latin digits only (0–9), for display and `tel:` — supports Arabic-Indic input. */
export function latinDigitsFromHotline(value: string): string {
  let out = "";
  for (const ch of value) {
    const d = toLatinDigitChar(ch);
    if (d) out += d;
  }
  return out || STORE_HOTLINE_FALLBACK;
}
