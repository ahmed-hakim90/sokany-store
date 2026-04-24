import "server-only";

import { getCmsStorefrontIntegrationsForServer } from "@/features/cms/services/getCmsStorefrontIntegrationsForServer";

/**
 * لروابط تُعرض في لوحة التحكم (مثل Webhook). الأفضل ‎`NEXT_PUBLIC_SITE_URL`‎ في الإنتاج.
 */
export function getStorefrontOrigin(): string {
  const fromSite = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim();
  if (fromSite) return fromSite;
  const fromApi = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "").trim();
  if (fromApi) return fromApi;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * **من Firestore (اختياري)** — ‎`publicStorefrontBaseUrl`‎ ثم نفس ترتيب ‎`getStorefrontOrigin`‎.
 * للاستيرادات اللازمة ‎`await` في مسارات تُنفَّذ في السيرفر.
 */
export async function resolveStorefrontPublicOriginForWebhooks(): Promise<string> {
  const int = await getCmsStorefrontIntegrationsForServer();
  const b = int?.publicStorefrontBaseUrl?.replace(/\/$/, "").trim();
  if (b) {
    try {
      return new URL(b).origin;
    } catch {
      /* env fallback */
    }
  }
  return getStorefrontOrigin();
}

export function getWooCommerceWebhookUrl(): string {
  return new URL(
    "/api/webhooks/woocommerce",
    `${getStorefrontOrigin()}/`,
  ).toString();
}

export async function resolveWooCommerceWebhookUrl(): Promise<string> {
  const root = await resolveStorefrontPublicOriginForWebhooks();
  return new URL(
    "/api/webhooks/woocommerce",
    `${root}/`,
  ).toString();
}

/** ويب هووك HMAC من API/سيرفر خارجي (جسم خام) — انظر ‎`/control/woo-api`‎. */
export function getExternalDataWebhookUrl(): string {
  return new URL(
    "/api/webhooks/external-data",
    `${getStorefrontOrigin()}/`,
  ).toString();
}

export async function resolveExternalDataWebhookUrl(): Promise<string> {
  const root = await resolveStorefrontPublicOriginForWebhooks();
  return new URL(
    "/api/webhooks/external-data",
    `${root}/`,
  ).toString();
}
