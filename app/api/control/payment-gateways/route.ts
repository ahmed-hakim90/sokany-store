/**
 * GET  /api/control/payment-gateways  — يقرأ إعدادات البوابات الحالية (بدون الأسرار الكاملة)
 * PUT  /api/control/payment-gateways  — يحفظ إعدادات فوري وباي موب في Firestore
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireScopeFull } from "@/lib/api-control-auth";
import {
  getFirestorePaymentGateways,
  savePaymentGateways,
  fawryConfigSchema,
  paymobConfigSchema,
} from "@/lib/payment-gateways-store";

export const runtime = "nodejs";

const putBodySchema = z.object({
  fawry: z
    .object({
      enabled: z.boolean(),
      merchantCode: z.string().trim(),
      secureKey: z.string().trim(),
      sandbox: z.boolean().default(false),
    })
    .optional(),
  paymob: z
    .object({
      enabled: z.boolean(),
      apiKey: z.string().trim(),
      integrationId: z.union([z.number(), z.string().transform(Number)]),
      iframeId: z.union([z.number(), z.string().transform(Number)]),
      hmacSecret: z.string().trim(),
    })
    .optional(),
});

function maskSecret(s: string | undefined): string {
  if (!s || s.length <= 8) return s ? "••••••••" : "";
  return s.slice(0, 4) + "••••" + s.slice(-4);
}

function hasFawryEnvConfig(): boolean {
  return Boolean(
    process.env.FAWRY_MERCHANT_CODE?.trim() &&
      (process.env.FAWRY_SECURE_KEY?.trim() || process.env.FAWRY_SECRET_KEY?.trim()),
  );
}

function shouldPreserveSecret(value: string): boolean {
  const trimmed = value.trim();
  return !trimmed || trimmed.includes("•");
}

function resolveSecretValue(
  incoming: string,
  existing: string | undefined,
  missingMessage: string,
): string | NextResponse {
  if (!shouldPreserveSecret(incoming)) return incoming;
  if (existing?.trim()) return existing;
  return NextResponse.json({ error: missingMessage }, { status: 400 });
}

export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const doc = await getFirestorePaymentGateways();
    const fawryEnabled = Boolean(doc?.fawry?.enabled);
    const paymobEnabled = Boolean(doc?.paymob?.enabled);
    const fawryEnvConfigPresent = hasFawryEnvConfig();

    return NextResponse.json({
      fawry: doc?.fawry
        ? {
            enabled: fawryEnabled,
            merchantCode: doc.fawry.merchantCode,
            secureKey: maskSecret(doc.fawry.secureKey),
            sandbox: doc.fawry.sandbox ?? false,
            source: "firestore",
            runtimeOverridesFirestore: fawryEnvConfigPresent,
          }
        : {
            enabled: Boolean(fawryEnvConfigPresent && process.env.FAWRY_ENABLED !== "false"),
            source: "env",
            runtimeOverridesFirestore: false,
          },
      paymob: doc?.paymob
        ? {
            enabled: paymobEnabled,
            apiKey: maskSecret(doc.paymob.apiKey),
            integrationId: doc.paymob.integrationId,
            iframeId: doc.paymob.iframeId,
            hmacSecret: maskSecret(doc.paymob.hmacSecret),
            source: "firestore",
          }
        : {
            enabled: Boolean(process.env.PAYMOB_API_KEY && process.env.PAYMOB_ENABLED !== "false"),
            source: "env",
          },
    });
  } catch (e) {
    console.error("[control/payment-gateways] GET failed", e);
    return NextResponse.json({ error: "قراءة الإعدادات فشلت" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json(
      { error: "Firebase Admin غير مُضاف — أضف FIREBASE_SERVICE_ACCOUNT_JSON في البيئة" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = putBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const toSave: {
    fawry?: ReturnType<typeof fawryConfigSchema.parse>;
    paymob?: ReturnType<typeof paymobConfigSchema.parse>;
  } = {};
  const existingDoc = await getFirestorePaymentGateways();

  if (parsed.data.fawry) {
    const secureKey = resolveSecretValue(
      parsed.data.fawry.secureKey,
      existingDoc?.fawry?.secureKey,
      "يرجى إدخال Secure Key الحقيقي لفوري",
    );
    if (secureKey instanceof NextResponse) return secureKey;

    const fawryParsed = fawryConfigSchema.safeParse({
      ...parsed.data.fawry,
      secureKey,
    });
    if (!fawryParsed.success) {
      return NextResponse.json(
        { error: "بيانات فوري غير صحيحة", details: fawryParsed.error.flatten() },
        { status: 400 },
      );
    }
    toSave.fawry = fawryParsed.data;
  }

  if (parsed.data.paymob) {
    const apiKey = resolveSecretValue(
      parsed.data.paymob.apiKey,
      existingDoc?.paymob?.apiKey,
      "يرجى إدخال API Key الحقيقي لباي موب",
    );
    if (apiKey instanceof NextResponse) return apiKey;

    const hmacSecret = resolveSecretValue(
      parsed.data.paymob.hmacSecret,
      existingDoc?.paymob?.hmacSecret,
      "يرجى إدخال HMAC Secret الحقيقي لباي موب",
    );
    if (hmacSecret instanceof NextResponse) return hmacSecret;

    const paymobParsed = paymobConfigSchema.safeParse({
      ...parsed.data.paymob,
      apiKey,
      hmacSecret,
    });
    if (!paymobParsed.success) {
      return NextResponse.json(
        { error: "بيانات باي موب غير صحيحة", details: paymobParsed.error.flatten() },
        { status: 400 },
      );
    }
    toSave.paymob = paymobParsed.data;
  }

  try {
    await savePaymentGateways(toSave, auth.uid);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[control/payment-gateways] PUT failed", e);
    return NextResponse.json({ error: "حفظ الإعدادات فشل" }, { status: 500 });
  }
}
