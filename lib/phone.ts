/**
 * Converts Arabic‑Indic digits (٠١٢…) and Eastern Arabic‑Indic (Persian ۰۱۲…) to ASCII 0–9.
 */
export function normalizeArabicIndicDigitsToAscii(input: string): string {
  let out = "";
  for (const ch of input) {
    const c = ch.codePointAt(0)!;
    if (c >= 0x0660 && c <= 0x0669) {
      out += String.fromCodePoint(0x30 + (c - 0x0660));
    } else if (c >= 0x06f0 && c <= 0x06f9) {
      out += String.fromCodePoint(0x30 + (c - 0x06f0));
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * Normalizes common Egypt mobile inputs to E.164 (+20…).
 * Accepts e.g. 01xxxxxxxxx, 1xxxxxxxxx, +201xxxxxxxxx.
 * Arabic‑Indic digits are converted automatically.
 */
export function normalizeEgyptPhoneToE164(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let digits = normalizeArabicIndicDigitsToAscii(trimmed).replace(/\s/g, "");
  if (digits.startsWith("+")) {
    digits = digits.slice(1);
  }

  if (digits.startsWith("20")) {
    return digits.length >= 11 && /^20\d{9,}$/.test(digits) ? `+${digits}` : null;
  }

  if (digits.startsWith("0") && digits.length >= 10) {
    const rest = digits.slice(1);
    if (/^1\d{8,9}$/.test(rest)) {
      return `+20${rest}`;
    }
  }

  if (/^1\d{9}$/.test(digits)) {
    return `+20${digits}`;
  }

  return null;
}
