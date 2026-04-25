/**
 * Normalizes common Egypt mobile inputs to E.164 (+20…).
 * Accepts e.g. 01xxxxxxxxx, 1xxxxxxxxx, +201xxxxxxxxx.
 */
export function normalizeEgyptPhoneToE164(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/\s/g, "");
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
