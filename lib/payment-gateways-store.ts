import "server-only";

import { z } from "zod";
import { getAdminFirestore } from "@/lib/firebase-admin";

const SECRETS_COLLECTION = "storefront_secrets";
const PAYMENT_GATEWAYS_DOC = "payment_gateways";

// ---------- Fawry ----------

export const fawryConfigSchema = z.object({
  enabled: z.boolean().default(false),
  merchantCode: z.string().trim().min(1),
  secureKey: z.string().trim().min(1),
  baseUrl: z.string().trim().url().optional(),
  hostedPaymentMethod: z
    .enum(["PayAtFawry", "CARD", "MWALLET", "VALU", "CashOnDelivery"])
    .optional(),
  /** true = sandbox, false = production */
  sandbox: z.boolean().default(false),
});

export type FawryConfig = z.infer<typeof fawryConfigSchema>;

// ---------- PayMob ----------

export const paymobConfigSchema = z.object({
  enabled: z.boolean().default(false),
  apiKey: z.string().trim().min(1),
  integrationId: z.number().int().positive(),
  iframeId: z.number().int().positive(),
  hmacSecret: z.string().trim().min(1),
});

export type PaymobConfig = z.infer<typeof paymobConfigSchema>;

// ---------- Combined document ----------

export const paymentGatewaysDocSchema = z.object({
  fawry: fawryConfigSchema.optional(),
  paymob: paymobConfigSchema.optional(),
  updatedAt: z.unknown().optional(),
  updatedByUid: z.string().optional(),
});

export type PaymentGatewaysDoc = z.infer<typeof paymentGatewaysDocSchema>;

// ---------- Env fallbacks ----------

function getFawryFromEnv(): FawryConfig | null {
  const merchantCode = process.env.FAWRY_MERCHANT_CODE?.trim();
  const secureKey =
    process.env.FAWRY_SECURE_KEY?.trim() ||
    process.env.FAWRY_SECRET_KEY?.trim();
  if (!merchantCode || !secureKey) return null;
  const baseUrl = process.env.FAWRY_BASE_URL?.trim();
  const hostedPaymentMethodRaw = process.env.FAWRY_HOSTED_PAYMENT_METHOD?.trim();
  const hostedPaymentMethod = fawryConfigSchema.shape.hostedPaymentMethod.safeParse(
    hostedPaymentMethodRaw || undefined,
  );
  return {
    enabled: process.env.FAWRY_ENABLED !== "false",
    merchantCode,
    secureKey,
    ...(baseUrl ? { baseUrl } : {}),
    ...(hostedPaymentMethod.success && hostedPaymentMethod.data
      ? { hostedPaymentMethod: hostedPaymentMethod.data }
      : {}),
    sandbox: process.env.FAWRY_SANDBOX === "true",
  };
}

function getPaymobFromEnv(): PaymobConfig | null {
  const apiKey = process.env.PAYMOB_API_KEY?.trim();
  const integrationIdRaw = process.env.PAYMOB_INTEGRATION_ID?.trim();
  const iframeIdRaw = process.env.PAYMOB_IFRAME_ID?.trim();
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET?.trim();
  if (!apiKey || !integrationIdRaw || !iframeIdRaw || !hmacSecret) return null;
  const integrationId = parseInt(integrationIdRaw, 10);
  const iframeId = parseInt(iframeIdRaw, 10);
  if (!Number.isFinite(integrationId) || !Number.isFinite(iframeId)) return null;
  return {
    enabled: process.env.PAYMOB_ENABLED !== "false",
    apiKey,
    integrationId,
    iframeId,
    hmacSecret,
  };
}

// ---------- Firestore read/write ----------

function getDocRef() {
  return getAdminFirestore()
    .collection(SECRETS_COLLECTION)
    .doc(PAYMENT_GATEWAYS_DOC);
}

export async function getFirestorePaymentGateways(): Promise<PaymentGatewaysDoc | null> {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) return null;
  try {
    const snap = await getDocRef().get();
    if (!snap.exists) return null;
    const parsed = paymentGatewaysDocSchema.safeParse(snap.data());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function savePaymentGateways(
  doc: Omit<PaymentGatewaysDoc, "updatedAt" | "updatedByUid">,
  updatedByUid: string,
): Promise<void> {
  const { default: admin } = await import("firebase-admin");
  await getDocRef().set(
    {
      ...doc,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedByUid,
    },
    { merge: true },
  );
}

// ---------- Resolved getters (env first, then Firestore) ----------

export async function resolveFawryConfig(): Promise<FawryConfig | null> {
  const fromEnv = getFawryFromEnv();
  if (fromEnv) return fromEnv;
  const doc = await getFirestorePaymentGateways();
  if (!doc?.fawry) return null;
  const parsed = fawryConfigSchema.safeParse(doc.fawry);
  return parsed.success ? parsed.data : null;
}

export async function resolvePaymobConfig(): Promise<PaymobConfig | null> {
  const fromEnv = getPaymobFromEnv();
  if (fromEnv) return fromEnv;
  const doc = await getFirestorePaymentGateways();
  if (!doc?.paymob) return null;
  const parsed = paymobConfigSchema.safeParse(doc.paymob);
  return parsed.success ? parsed.data : null;
}

/**
 * أي البوابات مفعّلة حاليًا — للواجهة (بدون أسرار)
 */
export async function resolveEnabledGateways(): Promise<{
  fawry: boolean;
  paymob: boolean;
}> {
  const [fawry, paymob] = await Promise.all([
    resolveFawryConfig(),
    resolvePaymobConfig(),
  ]);
  return {
    fawry: Boolean(fawry?.enabled),
    paymob: Boolean(paymob?.enabled),
  };
}
