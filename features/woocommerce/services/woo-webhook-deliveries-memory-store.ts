import "server-only";

import { createHash, randomUUID } from "node:crypto";

/** حد أقصى للسجل في الذاكرة لكل instance خادم (لا يُكتب في Firebase). */
const MAX_DELIVERIES = 200;

export type MemoryWebhookDelivery = {
  id: string;
  receivedAt: string;
  status: "processed" | "failed";
  error: string | null;
  topic: string | null;
  eventType: string | null;
  resourceId: string | null;
  wcWebhookId: string | null;
  wcWebhookResource: string | null;
  bodySha256: string;
  bodyBytes: number;
  processingTimeMs: number;
  payloadExcerpt: string;
  zodValidationError: string | null;
};

const deliveries: MemoryWebhookDelivery[] = [];

const PAYLOAD_EXCERPT_MAX = 10_000;

function payloadExcerpt(raw: string): string {
  if (raw.length <= PAYLOAD_EXCERPT_MAX) return raw;
  return `${raw.slice(0, PAYLOAD_EXCERPT_MAX)}\n/* … مقصوص */`;
}

export function appendWooWebhookDeliveryMemory(input: {
  requestHeaders: Headers;
  rawBody: string;
  topic: string | null;
  eventType: string | null;
  resourceId: string | number | null;
  status: "processed" | "failed";
  errorMessage?: string | null;
  processingTimeMs: number;
  zodValidationError?: string | null;
}): void {
  const bodyBytes = Buffer.byteLength(input.rawBody, "utf8");
  const bodySha256 = createHash("sha256").update(input.rawBody, "utf8").digest("hex");
  const resourceIdStr =
    input.resourceId == null
      ? null
      : typeof input.resourceId === "number"
        ? String(input.resourceId)
        : String(input.resourceId);

  const row: MemoryWebhookDelivery = {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    status: input.status,
    error: input.errorMessage?.trim() ? input.errorMessage.slice(0, 2000) : null,
    topic: input.topic,
    eventType: input.eventType,
    resourceId: resourceIdStr,
    wcWebhookId: input.requestHeaders.get("X-WC-Webhook-ID"),
    wcWebhookResource: input.requestHeaders.get("X-WC-Webhook-Resource"),
    bodySha256,
    bodyBytes,
    processingTimeMs: input.processingTimeMs,
    payloadExcerpt: payloadExcerpt(input.rawBody),
    zodValidationError:
      input.zodValidationError?.trim() && input.zodValidationError.length > 0
        ? input.zodValidationError.slice(0, 4000)
        : null,
  };

  deliveries.unshift(row);
  while (deliveries.length > MAX_DELIVERIES) {
    deliveries.pop();
  }
}

export function getWooWebhookDeliveryById(id: string): MemoryWebhookDelivery | null {
  return deliveries.find((d) => d.id === id) ?? null;
}

export function listWooWebhookDeliveriesMemory(
  limit: number,
  cursorId: string | null,
): { items: MemoryWebhookDelivery[]; nextCursor: string | null } {
  let start = 0;
  if (cursorId) {
    const i = deliveries.findIndex((d) => d.id === cursorId);
    if (i >= 0) start = i + 1;
  }
  const slice = deliveries.slice(start, start + limit);
  const nextCursor =
    slice.length === limit && slice.length > 0 ? slice[slice.length - 1]!.id : null;
  return { items: slice, nextCursor };
}

export function aggregateWooWebhookDeliveriesMemory(windowMs: number): {
  lastEventAt: string | null;
  processed: number;
  failed: number;
  avgProcessingTimeMs: number | null;
  sampleSize: number;
} {
  const now = Date.now();
  const from = now - windowMs;
  let lastEventAt: string | null = null;
  let processed = 0;
  let failed = 0;
  let sumMs = 0;
  let nMs = 0;

  for (const d of deliveries) {
    const at = new Date(d.receivedAt).getTime();
    if (Number.isNaN(at)) continue;
    if (lastEventAt === null) lastEventAt = d.receivedAt;
    if (at < from) continue;
    if (d.status === "failed") failed += 1;
    else processed += 1;
    if (Number.isFinite(d.processingTimeMs)) {
      sumMs += d.processingTimeMs;
      nMs += 1;
    }
  }

  return {
    lastEventAt,
    processed,
    failed,
    avgProcessingTimeMs: nMs > 0 ? Math.round(sumMs / nMs) : null,
    sampleSize: processed + failed,
  };
}
