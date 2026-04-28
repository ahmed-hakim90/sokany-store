import "server-only";

import * as admin from "firebase-admin";
import { getFirebaseAdminApp } from "@/lib/firebase-admin";
import {
  WOO_CACHE_INVALIDATION_MESSAGE_TYPE,
  type WooCacheInvalidationScope,
} from "@/lib/storefront-offline-cache";

const STOREFRONT_CUSTOMERS_TOPIC = "all_customers";

function scopeFromWooTopic(topic: string | null): WooCacheInvalidationScope {
  const t = (topic ?? "").toLowerCase().trim();
  if (t.startsWith("product_cat.")) return "categories";
  if (t.startsWith("product.")) return "products";
  if (t.startsWith("order.")) return "orders";
  if (t.includes("review")) return "reviews";
  return "all";
}

export async function sendWooCacheInvalidation(input: {
  topic: string | null;
  resourceId: number | string | null;
}): Promise<{ sent: boolean; reason?: string }> {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return { sent: false, reason: "firebase-admin-not-configured" };
  }

  const app = getFirebaseAdminApp();
  const topic = input.topic ?? "";
  const resourceId = input.resourceId == null ? "" : String(input.resourceId);

  await admin.messaging(app).send({
    topic: STOREFRONT_CUSTOMERS_TOPIC,
    data: {
      type: WOO_CACHE_INVALIDATION_MESSAGE_TYPE,
      topic,
      resourceId,
      scope: scopeFromWooTopic(input.topic),
    },
    webpush: {
      fcmOptions: {
        link: "/",
      },
    },
  });

  return { sent: true };
}
