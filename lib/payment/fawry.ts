import "server-only";

import { createHash } from "crypto";
import { z } from "zod";
import type { FawryConfig } from "@/lib/payment-gateways-store";

const FAWRY_PRODUCTION_URL = "https://atfawry.com/ECommerceWeb/Fawry/payments/charge";
const FAWRY_SANDBOX_URL =
  "https://atfawry.fawrystaging.com/ECommerceWeb/Fawry/payments/charge";

export type FawryChargeItem = {
  itemId: string;
  description: string;
  price: number;
  quantity: number;
};

export type FawryChargeRequest = {
  merchantRefNum: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  customerProfileId?: string;
  chargeItems: FawryChargeItem[];
  returnUrl: string;
  /** توقيت انتهاء الدفع بالميلي ثانية (Unix timestamp) — الافتراضي ساعة واحدة */
  paymentExpiry?: number;
};

const fawryChargeResponseSchema = z.object({
  type: z.string().optional(),
  referenceNumber: z.string().optional(),
  merchantRefNumber: z.string().optional(),
  paymentAmount: z.number().optional(),
  statusCode: z.number().optional(),
  statusDescription: z.string().optional(),
  redirectUrl: z.string().optional(),
  nextAction: z
    .object({ redirectUrl: z.string().optional(), type: z.string().optional() })
    .optional(),
});

export type FawryChargeResponse = z.infer<typeof fawryChargeResponseSchema>;

/**
 * حساب توقيع SHA-256 لطلب فوري
 * صيغة التوقيع: merchantCode + merchantRefNum + customerProfileId? + customerMobile + customerEmail
 *               + (itemId + price(2dp) + quantity)... + paymentExpiry + secureKey
 */
function buildFawrySignature(
  config: FawryConfig,
  req: FawryChargeRequest,
  paymentExpiry: number,
): string {
  const profilePart = req.customerProfileId ?? "";
  const itemsPart = req.chargeItems
    .map((item) => `${item.itemId}${item.price.toFixed(2)}${item.quantity}`)
    .join("");
  const raw = [
    config.merchantCode,
    req.merchantRefNum,
    profilePart,
    req.customerMobile,
    req.customerEmail,
    itemsPart,
    String(paymentExpiry),
    config.secureKey,
  ].join("");
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * يُنشئ طلب دفع فوري بالبطاقة ويُعيد رابط إعادة التوجيه للعميل
 */
export async function initiateFawryCharge(
  config: FawryConfig,
  req: FawryChargeRequest,
): Promise<{ redirectUrl: string; referenceNumber?: string }> {
  const baseUrl = config.sandbox ? FAWRY_SANDBOX_URL : FAWRY_PRODUCTION_URL;
  const paymentExpiry =
    req.paymentExpiry ?? Date.now() + 60 * 60 * 1000;

  const signature = buildFawrySignature(config, req, paymentExpiry);

  const body = {
    merchantCode: config.merchantCode,
    merchantRefNum: req.merchantRefNum,
    customerName: req.customerName,
    customerMobile: req.customerMobile,
    customerEmail: req.customerEmail,
    ...(req.customerProfileId ? { customerProfileId: req.customerProfileId } : {}),
    paymentExpiry,
    language: "ar-eg",
    chargeItems: req.chargeItems.map((item) => ({
      itemId: item.itemId,
      description: item.description,
      price: item.price,
      quantity: item.quantity,
    })),
    returnUrl: req.returnUrl,
    authCaptureModePayment: false,
    paymentMethod: "CARD",
    signature,
  };

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fawry API error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = fawryChargeResponseSchema.parse(await res.json());

  if (data.statusCode !== undefined && data.statusCode !== 200) {
    throw new Error(
      `Fawry charge failed: ${data.statusDescription ?? String(data.statusCode)}`,
    );
  }

  const redirectUrl =
    data.redirectUrl ?? data.nextAction?.redirectUrl;
  if (!redirectUrl) {
    throw new Error("Fawry did not return a redirectUrl");
  }

  return { redirectUrl, referenceNumber: data.referenceNumber };
}

/**
 * يتحقق من صحة إشعار الدفع الوارد من فوري (IPN / callback)
 * الحقول: merchantRefNum + orderRefNum + paymentAmount + orderStatus + secureKey
 */
export function verifyFawryCallbackSignature(params: {
  merchantRefNum: string;
  orderRefNum: string;
  paymentAmount: string | number;
  orderStatus: string;
  secureKey: string;
  signature: string;
}): boolean {
  const raw = [
    params.merchantRefNum,
    params.orderRefNum,
    String(params.paymentAmount),
    params.orderStatus,
    params.secureKey,
  ].join("");
  const expected = createHash("sha256").update(raw).digest("hex");
  return expected === params.signature;
}

/**
 * يستخرج معرف الطلب من merchantRefNum (الصيغة: sokany-{orderId}-{timestamp})
 */
export function extractOrderIdFromFawryRef(merchantRefNum: string): number | null {
  const match = /^sokany-(\d+)-/.exec(merchantRefNum);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  return Number.isFinite(id) ? id : null;
}
