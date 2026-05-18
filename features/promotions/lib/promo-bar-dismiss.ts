const DISMISS_STORAGE_KEY = "storefront-promo-bar-dismissed";

export const PROMO_BAR_DISMISS_EVENT = "storefront-promo-bar-dismissed";

function readDismissedCodes(): string[] {
  try {
    const raw = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c): c is string => typeof c === "string").map((c) => c.toUpperCase());
  } catch {
    return [];
  }
}

export function isPromoBarDismissed(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return false;
  return readDismissedCodes().includes(normalized);
}

export function dismissPromoBar(code: string): void {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return;
  try {
    const codes = readDismissedCodes();
    if (codes.includes(normalized)) return;
    localStorage.setItem(
      DISMISS_STORAGE_KEY,
      JSON.stringify([...codes, normalized]),
    );
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(PROMO_BAR_DISMISS_EVENT, { detail: { code: normalized } }),
    );
  }
}
