const STORAGE_KEY = "sokany-recent-product-searches";
const MAX_RECENT = 6;

function readRaw(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is string => typeof v === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function getRecentProductSearches(): string[] {
  return readRaw();
}

export function rememberProductSearch(query: string): void {
  const q = query.trim();
  if (q.length < 2 || typeof window === "undefined") return;
  const next = [q, ...readRaw().filter((item) => item !== q)].slice(0, MAX_RECENT);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

export function clearRecentProductSearches(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
