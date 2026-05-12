import "server-only";

import { createHmac } from "crypto";
import { z } from "zod";
import type { PaymobConfig } from "@/lib/payment-gateways-store";

const PAYMOB_BASE = "https://accept.paymob.com/api";
const PAYMOB_IFRAME_BASE = "https://accept.paymob.com/api/acceptance/iframes";

// ---------- Step 1: Auth token ----------

const authTokenResponseSchema = z.object({
  token: z.string(),
  profile: z.object({ id: z.number() }).passthrough().optional(),
});

async function getAuthToken(apiKey: string): Promise<string> {
  const res = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) {
    throw new Error(`PayMob auth failed: ${res.status}`);
  }
  const data = authTokenResponseSchema.parse(await res.json());
  return data.token;
}

// ---------- Step 2: Create order ----------

const paymobOrderResponseSchema = z.object({
  id: z.number(),
  created_at: z.string().optional(),
  merchant_order_id: z.string().nullable().optional(),
});

async function createPaymobOrder(params: {
  authToken: string;
  amountCents: number;
  merchantOrderId: string;
  currency?: string;
}): Promise<number> {
  const res = await fetch(`${PAYMOB_BASE}/ecommerce/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: params.authToken,
      delivery_needed: false,
      amount_cents: params.amountCents,
      currency: params.currency ?? "EGP",
      merchant_order_id: params.merchantOrderId,
      items: [],
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PayMob create order failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const data = paymobOrderResponseSchema.parse(await res.json());
  return data.id;
}

// ---------- Step 3: Payment key ----------

const paymentKeyResponseSchema = z.object({
  token: z.string(),
});

export type PaymobBillingData = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  apartment?: string;
  floor?: string;
  street?: string;
  building?: string;
  city?: string;
  state?: string;
  country?: string;
};

async function requestPaymentKey(params: {
  authToken: string;
  amountCents: number;
  paymobOrderId: number;
  integrationId: number;
  billingData: PaymobBillingData;
  currency?: string;
  expiration?: number;
}): Promise<string> {
  const b = params.billingData;
  const res = await fetch(`${PAYMOB_BASE}/acceptance/payment_keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: params.authToken,
      amount_cents: params.amountCents,
      expiration: params.expiration ?? 3600,
      order_id: params.paymobOrderId,
      billing_data: {
        first_name: b.firstName,
        last_name: b.lastName,
        email: b.email,
        phone_number: b.phoneNumber,
        apartment: b.apartment ?? "NA",
        floor: b.floor ?? "NA",
        street: b.street ?? "NA",
        building: b.building ?? "NA",
        city: b.city ?? "NA",
        state: b.state ?? "NA",
        country: b.country ?? "EG",
        postal_code: "NA",
        shipping_method: "PKG",
      },
      currency: params.currency ?? "EGP",
      integration_id: params.integrationId,
      lock_order_when_paid: false,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PayMob payment key failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const data = paymentKeyResponseSchema.parse(await res.json());
  return data.token;
}

// ---------- Public API ----------

export type PaymobInitiateRequest = {
  merchantOrderId: string;
  amountCents: number;
  billingData: PaymobBillingData;
  currency?: string;
};

/**
 * ينفذ الخطوات الثلاث لباي موب ويُعيد رابط iframe الدفع
 */
export async function initiatePaymobPayment(
  config: PaymobConfig,
  req: PaymobInitiateRequest,
): Promise<{ iframeUrl: string }> {
  const authToken = await getAuthToken(config.apiKey);
  const paymobOrderId = await createPaymobOrder({
    authToken,
    amountCents: req.amountCents,
    merchantOrderId: req.merchantOrderId,
    currency: req.currency,
  });
  const paymentKey = await requestPaymentKey({
    authToken,
    amountCents: req.amountCents,
    paymobOrderId,
    integrationId: config.integrationId,
    billingData: req.billingData,
    currency: req.currency,
  });

  const iframeUrl = `${PAYMOB_IFRAME_BASE}/${config.iframeId}?payment_token=${paymentKey}`;
  return { iframeUrl };
}

/**
 * يتحقق من HMAC إشعار باي موب
 * الحقول مرتبة أبجدياً بدون hmac:
 * amount_cents + created_at + currency + error_occured + has_parent_transaction + id
 * + integration_id + is_3d_secure + is_auth + is_capture + is_refunded
 * + is_standalone_payment + is_voided + order + owner + pending
 * + source_data.pan + source_data.sub_type + source_data.type + success
 */
export function verifyPaymobHmac(
  hmacSecret: string,
  params: Record<string, string>,
  receivedHmac: string,
): boolean {
  const orderedKeys = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
  ];
  const concatenated = orderedKeys
    .map((key) => params[key] ?? "")
    .join("");
  const expected = createHmac("sha512", hmacSecret)
    .update(concatenated)
    .digest("hex");
  return expected === receivedHmac;
}

/**
 * يستخرج معرف طلب سوكانى من merchantOrderId (الصيغة: sokany-{orderId})
 */
export function extractOrderIdFromPaymobRef(merchantOrderId: string): number | null {
  const match = /^sokany-(\d+)$/.exec(merchantOrderId);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  return Number.isFinite(id) ? id : null;
}
