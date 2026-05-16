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

export type PaymentGatewaysSaveInput = Omit<
  PaymentGatewaysDoc,
  "updatedAt" | "updatedByUid"
> & {
  /** يزيل fawry.hostedPaymentMethod من مستند Firestore (اختيار «كل الطرق») */
  fawryClearHostedPaymentMethod?: boolean;
};

/** يبني كائناً صالحاً لـ Firestore بدون قيم undefined */
export function buildGatewayConfigForFirestore(
  config: Record<string, unknown>,
  options?: { hostedPaymentMethodField?: unknown },
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) continue;
    out[key] = value;
  }
  if (options && "hostedPaymentMethodField" in options) {
    out.hostedPaymentMethod = options.hostedPaymentMethodField;
  }
  return out;
}

// ---------- Env fallbacks ----------

function getFawryHostedPaymentMethodFromEnv(): FawryConfig["hostedPaymentMethod"] {
  const hostedPaymentMethodRaw = process.env.FAWRY_HOSTED_PAYMENT_METHOD?.trim();
  const hostedPaymentMethod = fawryConfigSchema.shape.hostedPaymentMethod.safeParse(
    hostedPaymentMethodRaw || undefined,
  );
  return hostedPaymentMethod.success ? hostedPaymentMethod.data : undefined;
}

function withFawryEnvOverrides(config: FawryConfig): FawryConfig {
  const hostedPaymentMethod = getFawryHostedPaymentMethodFromEnv();
  return hostedPaymentMethod ? { ...config, hostedPaymentMethod } : config;
}

function getFawryFromEnv(): FawryConfig | null {
  const merchantCode = process.env.FAWRY_MERCHANT_CODE?.trim();
  const secureKey =
    process.env.FAWRY_SECURE_KEY?.trim() ||
    process.env.FAWRY_SECRET_KEY?.trim();
  if (!merchantCode || !secureKey) return null;
  const baseUrl = process.env.FAWRY_BASE_URL?.trim();
  const hostedPaymentMethod = getFawryHostedPaymentMethodFromEnv();
  return {
    enabled: process.env.FAWRY_ENABLED !== "false",
    merchantCode,
    secureKey,
    ...(baseUrl ? { baseUrl } : {}),
    ...(hostedPaymentMethod ? { hostedPaymentMethod } : {}),
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
  doc: PaymentGatewaysSaveInput,
  updatedByUid: string,
): Promise<void> {
  const { default: admin } = await import("firebase-admin");
  const { fawryClearHostedPaymentMethod, fawry, paymob } = doc;

  const payload: Record<string, unknown> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedByUid,
  };

  if (fawry) {
    payload.fawry = buildGatewayConfigForFirestore(
      fawry as unknown as Record<string, unknown>,
      fawryClearHostedPaymentMethod
        ? { hostedPaymentMethodField: admin.firestore.FieldValue.delete() }
        : undefined,
    );
  }
  if (paymob) {
    payload.paymob = buildGatewayConfigForFirestore(
      paymob as unknown as Record<string, unknown>,
    );
  }

  await getDocRef().set(payload, { merge: true });
}

// ---------- Resolved getters (env first, then Firestore) ----------

export async function resolveFawryConfig(): Promise<FawryConfig | null> {
  const fromEnv = getFawryFromEnv();
  if (fromEnv) return fromEnv;
  const doc = await getFirestorePaymentGateways();
  if (!doc?.fawry) return null;
  const parsed = fawryConfigSchema.safeParse(doc.fawry);
  return parsed.success ? withFawryEnvOverrides(parsed.data) : null;
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
