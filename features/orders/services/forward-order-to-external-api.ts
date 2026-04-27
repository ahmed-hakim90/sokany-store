import "server-only";

import {
  CONTROL_SETTINGS_COLLECTION,
  CONTROL_SETTINGS_DOC_IDS,
} from "@/features/control/lib/collections";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { orderForwardingSettingsPrivateSchema } from "@/schemas/order-forwarding";

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
  try {
    response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sokany-event": "order.created",
        [settings.secretHeaderName]: secret,
      },
      body: JSON.stringify({
        event: "order.created",
        source: "sokany-store",
        order,
        sentAt: new Date().toISOString(),
      }),
    });
  } catch (e) {
    return {
      status: "failed",
      reason: e instanceof Error ? e.message : "network-error",
    };
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
