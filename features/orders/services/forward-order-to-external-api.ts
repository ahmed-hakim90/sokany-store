import "server-only";

import {
  CONTROL_SETTINGS_COLLECTION,
  CONTROL_SETTINGS_DOC_IDS,
} from "@/features/control/lib/collections";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { ROUTES } from "@/lib/constants";
import { toAbsoluteSiteUrl } from "@/lib/site";
import { orderForwardingSettingsPrivateSchema } from "@/schemas/order-forwarding";

const ORDER_FORWARDING_TIMEOUT_MS = 5_000;

type ForwardOrderCreatedResult =
  | { status: "skipped"; reason: string }
  | { status: "sent"; statusCode: number }
  | { status: "failed"; reason: string; statusCode?: number };

async function readOrderForwardingSettings() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return null;
  }

  const db = getAdminFirestore();
  const snap = await db
    .collection(CONTROL_SETTINGS_COLLECTION)
    .doc(CONTROL_SETTINGS_DOC_IDS.orderForwarding)
    .get();

  const parsed = orderForwardingSettingsPrivateSchema.safeParse(
    snap.exists ? snap.data() : {},
  );
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}

function readOrderId(order: unknown): number | null {
  if (!order || typeof order !== "object") return null;
  const raw = (order as { id?: unknown; storefront_order_id?: unknown }).storefront_order_id ??
    (order as { id?: unknown }).id;
  const id = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(id) ? id : null;
}

function readOrderNumber(order: unknown, orderId: number | null): string | null {
  if (!order || typeof order !== "object") return orderId == null ? null : String(orderId);
  const raw = (order as { storefront_order_number?: unknown; number?: unknown })
    .storefront_order_number ??
    (order as { number?: unknown }).number;
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  return orderId == null ? null : String(orderId);
}

function readTrackingUrl(order: unknown, orderId: number | null): string | null {
  if (order && typeof order === "object") {
    const raw = (order as { storefront_tracking_url?: unknown }).storefront_tracking_url;
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  if (orderId == null) return null;
  return toAbsoluteSiteUrl(`${ROUTES.ORDER_TRACKING}?q=${encodeURIComponent(String(orderId))}`);
}

export async function forwardOrderCreatedToExternalApi(
  order: unknown,
): Promise<ForwardOrderCreatedResult> {
  const settings = await readOrderForwardingSettings();
  if (!settings) {
    return { status: "skipped", reason: "firebase-not-configured" };
  }
  if (!settings.enabled) {
    return { status: "skipped", reason: "disabled" };
  }

  const apiUrl = settings.apiUrl?.trim();
  const secret = settings.secret?.trim();
  if (!apiUrl || !secret) {
    return { status: "skipped", reason: "missing-api-url-or-secret" };
  }

  let response: Response;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), ORDER_FORWARDING_TIMEOUT_MS);
    const orderId = readOrderId(order);
    const orderNumber = readOrderNumber(order, orderId);
    const trackingUrl = readTrackingUrl(order, orderId);
    response = await fetch(apiUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "x-sokany-event": "order.created",
        [settings.secretHeaderName]: secret,
      },
      body: JSON.stringify({
        event: "order.created",
        source: "sokany-store",
        orderId,
        orderNumber,
        trackingUrl,
        order,
        sentAt: new Date().toISOString(),
      }),
    });
  } catch (e) {
    return {
      status: "failed",
      reason: e instanceof Error ? e.message : "network-error",
    };
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return {
      status: "failed",
      statusCode: response.status,
      reason: body ? body.slice(0, 500) : response.statusText,
    };
  }

  return { status: "sent", statusCode: response.status };
}
