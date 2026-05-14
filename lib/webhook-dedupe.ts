/**
 * منع تكرار إبطال الكاش لنفس حدث Woo خلال نافذة قصيرة.
 *
 * التخزين في الذاكرة لكل instance خادم؛ الواجهة صغيرة حتى يمكن استبداله لاحقاً
 * بـ Redis/Upstash من غير تغيير مسارات الويبهوك.
 */
const seenAtByKey = new Map<string, number>();

const DEFAULT_TTL_MS = 20_000;
const MIN_TTL_MS = 10_000;
const MAX_TTL_MS = 60_000;
const PRUNE_EVERY_MS = 120_000;

let lastPrunedAt = 0;

function pruneExpired(now: number): void {
  if (now - lastPrunedAt < PRUNE_EVERY_MS) return;
  lastPrunedAt = now;
  const oldestUsefulTimestamp = now - MAX_TTL_MS;
  for (const [key, seenAt] of seenAtByKey) {
    if (seenAt < oldestUsefulTimestamp) {
      seenAtByKey.delete(key);
    }
  }
}

function parseDedupeTtlMs(): number {
  const raw = process.env.WEBHOOK_REVALIDATE_DEDUPE_MS?.trim();
  if (!raw) return DEFAULT_TTL_MS;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return DEFAULT_TTL_MS;
  return Math.min(MAX_TTL_MS, Math.max(MIN_TTL_MS, n));
}

export function buildWooWebhookDedupeKey(
  topic: string | null,
  resourceId: string | number | null | undefined,
): string {
  const safeTopic = (topic ?? "unknown").toLowerCase().trim() || "unknown";
  const safeResourceId =
    resourceId === null || resourceId === undefined
      ? "none"
      : String(resourceId).trim() || "none";
  return `woo:${safeTopic}:${safeResourceId}`;
}

export function shouldSkipWebhookRevalidation(
  key: string,
  ttlMs: number = parseDedupeTtlMs(),
): boolean {
  const dedupeKey = key.trim();
  if (!dedupeKey) return false;

  const now = Date.now();
  pruneExpired(now);

  const seenAt = seenAtByKey.get(dedupeKey);
  if (seenAt !== undefined && now - seenAt < ttlMs) {
    return true;
  }

  seenAtByKey.set(dedupeKey, now);
  return false;
}

