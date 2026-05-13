import "server-only";

import { createHash } from "crypto";
import { z } from "zod";
import type { FawryConfig } from "@/lib/payment-gateways-store";
import {
  buildFawryHostedSignature,
  formatFawryAmount,
} from "@/lib/payment/fawry-signature";

const FAWRY_PRODUCTION_URL = "https://atfawry.com/ECommerceWeb/Fawry/payments/charge";
const FAWRY_SANDBOX_URL =
  "https://atfawry.fawrystaging.com/ECommerceWeb/Fawry/payments/charge";
const FAWRY_REQUEST_TIMEOUT_MS = 10_000;
const SEEN_MERCHANT_REFS = new Set<string>();

export type FawryHostedPaymentMethod =
  | "PayAtFawry"
  | "CARD"
  | "MWALLET"
  | "VALU"
  | "CashOnDelivery";

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
  /**
   * Optional hosted-page restriction. Omit to let Fawry show all methods
   * enabled on the merchant profile. Some Fawry profiles require this.
   */
  paymentMethod?: FawryHostedPaymentMethod;
  /** توقيت انتهاء الدفع بالميلي ثانية (Unix timestamp) — الافتراضي ساعة واحدة */
  paymentExpiry?: number;
};

const optionalResponseStringSchema = z
  .union([z.string(), z.number()])
  .optional()
  .transform((value) => (value == null ? undefined : String(value)));

const optionalResponseNumberSchema = z
  .union([z.number(), z.string()])
  .optional()
  .transform((value) => {
    if (value == null || value === "") return undefined;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  });

const fawryChargeResponseSchema = z.object({
  type: z.string().optional(),
  referenceNumber: optionalResponseStringSchema,
  merchantRefNumber: optionalResponseStringSchema,
  paymentAmount: optionalResponseNumberSchema,
  statusCode: optionalResponseNumberSchema,
  statusDescription: z.string().optional(),
  redirectUrl: z.string().optional(),
  paymentUrl: z.string().optional(),
  paymentURL: z.string().optional(),
  nextAction: z
    .object({ redirectUrl: z.string().optional(), type: z.string().optional() })
    .optional(),
});

export type FawryChargeResponse = z.infer<typeof fawryChargeResponseSchema>;

export type FawryChargeErrorCode =
  | "invalid_config"
  | "invalid_signature"
  | "duplicate_reference"
  | "invalid_amount"
  | "invalid_customer"
  | "environment_mismatch"
  | "hosted_profile_mismatch"
  | "missing_payment_url"
  | "network_timeout"
  | "network_error"
  | "fawry_unavailable"
  | "invalid_response"
  | "charge_failed";

export class FawryChargeError extends Error {
  readonly code: FawryChargeErrorCode;
  readonly userMessage: string;
  readonly httpStatus?: number;
  readonly fawryStatusCode?: number;
  readonly statusDescription?: string;

  constructor(params: {
    code: FawryChargeErrorCode;
    message: string;
    userMessage: string;
    httpStatus?: number;
    fawryStatusCode?: number;
    statusDescription?: string;
    cause?: unknown;
  }) {
    super(params.message, { cause: params.cause });
    this.name = "FawryChargeError";
    this.code = params.code;
    this.userMessage = params.userMessage;
    this.httpStatus = params.httpStatus;
    this.fawryStatusCode = params.fawryStatusCode;
    this.statusDescription = params.statusDescription;
  }
}

function maskMiddle(value: string | undefined, visible = 4): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (trimmed.length <= visible * 2) return "*".repeat(trimmed.length);
  return `${trimmed.slice(0, visible)}********${trimmed.slice(-visible)}`;
}

function maskEmail(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const [local, domain] = trimmed.split("@");
  if (!domain) return maskMiddle(trimmed, 2);
  return `${local.slice(0, 2)}***@${domain}`;
}

function normalizePhone(value: string): string {
  const digits = value.trim().replace(/[^\d+]/g, "");
  if (digits.startsWith("+20")) return `0${digits.slice(3)}`;
  if (digits.startsWith("20") && digits.length === 12) return `0${digits.slice(2)}`;
  return digits;
}

function isValidEgyptianMobile(value: string): boolean {
  return /^01[0125]\d{8}$/.test(value);
}

function getFawryEndpoint(config: FawryConfig): string {
  return (config.baseUrl?.trim() || (config.sandbox ? FAWRY_SANDBOX_URL : FAWRY_PRODUCTION_URL))
    .replace(/\/$/, "");
}

function warnIfEnvironmentMismatch(endpoint: string, sandbox: boolean): string | null {
  const host = (() => {
    try {
      return new URL(endpoint).host;
    } catch {
      return "";
    }
  })();
  if (sandbox && !host.includes("fawrystaging")) {
    return "sandbox-config-uses-non-staging-fawry-url";
  }
  if (!sandbox && host.includes("fawrystaging")) {
    return "production-config-uses-staging-fawry-url";
  }
  return null;
}

function classifyFawryFailure(
  data: FawryChargeResponse,
): Pick<FawryChargeError, "code" | "userMessage"> {
  const statusDescription = data.statusDescription ?? "";
  if (data.statusCode === 9929 || /ticket|تذكرة|signature/i.test(statusDescription)) {
    return {
      code: "invalid_signature",
      userMessage: "تعذر التحقق من توقيع جلسة فوري. راجع بيانات التاجر أو مفتاح Fawry.",
    };
  }
  if (data.statusCode === 10045 || /paymentMethod element is mandatory/i.test(statusDescription)) {
    return {
      code: "hosted_profile_mismatch",
      userMessage:
        "إعدادات حساب فوري الحالية تتطلب تحديد طريقة الدفع للصفحة المستضافة.",
    };
  }
  if (/duplicate|duplicated|مكرر/i.test(statusDescription)) {
    return {
      code: "duplicate_reference",
      userMessage: "تم إرسال طلب الدفع لهذا الطلب من قبل. راجع حالة الطلب أو حاول بعد قليل.",
    };
  }
  if (data.statusCode === 9903) {
    return {
      code: "fawry_unavailable",
      userMessage:
        "فوري رفض إنشاء صفحة الدفع حالياً. تحقق من تفعيل Hosted Checkout وطرق الدفع على حساب التاجر.",
    };
  }
  return {
    code: "charge_failed",
    userMessage: "تعذر بدء الدفع عبر فوري. حاول مرة أخرى أو اختر طريقة دفع أخرى.",
  };
}

function logFawryEvent(
  level: "info" | "warn" | "error",
  message: string,
  details: Record<string, unknown>,
): void {
  const payload = {
    ...details,
    timestamp: new Date().toISOString(),
  };
  const logger = level === "info" ? console.info : level === "warn" ? console.warn : console.error;
  logger(`[fawry] ${message}`, payload);
}

function isQuotedEnvLikeValue(value: string): boolean {
  const trimmed = value.trim();
  return (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  );
}

/**
 * يُنشئ جلسة Fawry Hosted Checkout لطلب Woo موجود ويعيد رابط صفحة الدفع.
 */
export async function initiateFawryCharge(
  config: FawryConfig,
  req: FawryChargeRequest,
): Promise<{
  redirectUrl: string;
  merchantRefNum: string;
  paymentMethod?: FawryHostedPaymentMethod;
  referenceNumber?: string;
}> {
  const endpoint = getFawryEndpoint(config);
  const merchantCode = config.merchantCode.trim();
  const secureKey = config.secureKey.trim();
  const merchantRefNum = req.merchantRefNum.trim();
  const customerMobile = normalizePhone(req.customerMobile);
  const customerEmail = req.customerEmail.trim();
  const paymentExpiry =
    req.paymentExpiry ?? Date.now() + 60 * 60 * 1000;

  const paymentAmount = Number(
    req.chargeItems
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2),
  );
  let paymentAmountText: string;
  try {
    paymentAmountText = formatFawryAmount(paymentAmount);
  } catch (e) {
    throw new FawryChargeError({
      code: "invalid_amount",
      message: `Invalid Fawry amount: ${String(paymentAmount)}`,
      userMessage: "إجمالي الطلب غير صالح للدفع عبر فوري.",
      cause: e,
    });
  }

  const warnings = [
    warnIfEnvironmentMismatch(endpoint, config.sandbox),
    SEEN_MERCHANT_REFS.has(merchantRefNum) ? "merchantRefNum-seen-before-in-this-runtime" : null,
    !merchantCode ? "missing-merchant-code" : null,
    !secureKey ? "missing-secure-key" : null,
    isQuotedEnvLikeValue(merchantCode) ? "merchant-code-looks-quoted" : null,
    isQuotedEnvLikeValue(secureKey) ? "secure-key-looks-quoted" : null,
    !isValidEgyptianMobile(customerMobile) ? "invalid-egyptian-mobile-format" : null,
    !customerEmail ? "empty-customer-email" : null,
  ].filter(Boolean);

  if (!merchantCode || !secureKey) {
    throw new FawryChargeError({
      code: "invalid_config",
      message: "Fawry merchantCode or secureKey is missing",
      userMessage: "بوابة فوري غير مكتملة الإعداد.",
    });
  }
  if (!customerMobile || !isValidEgyptianMobile(customerMobile)) {
    throw new FawryChargeError({
      code: "invalid_customer",
      message: `Invalid Fawry customer mobile: ${customerMobile || "(empty)"}`,
      userMessage: "رقم الموبايل غير صالح للدفع عبر فوري. أدخل رقم مصري صحيح.",
    });
  }

  const normalizedItems = req.chargeItems.map((item) => ({
    itemId: item.itemId.trim(),
    description: item.description.trim(),
    price: Number(item.price.toFixed(2)),
    quantity: item.quantity,
  }));

  const signature = buildFawryHostedSignature({
    merchantCode,
    merchantRefNum,
    customerProfileId: req.customerProfileId,
    returnUrl: req.returnUrl,
    chargeItems: normalizedItems,
    secureKey,
  });

  const body = {
    merchantCode,
    merchantRefNum,
    customerName: req.customerName.trim(),
    customerMobile,
    customerEmail,
    ...(req.customerProfileId ? { customerProfileId: req.customerProfileId } : {}),
    paymentExpiry,
    language: "ar-eg",
    chargeItems: normalizedItems,
    ...(req.paymentMethod ? { paymentMethod: req.paymentMethod } : {}),
    returnUrl: req.returnUrl,
    authCaptureModePayment: false,
    description: req.chargeItems.map((item) => item.description).join("، "),
    signature,
  };

  const recomputedSignature = buildFawryHostedSignature({
    merchantCode: body.merchantCode,
    merchantRefNum: body.merchantRefNum,
    customerProfileId: req.customerProfileId,
    returnUrl: body.returnUrl,
    chargeItems: body.chargeItems,
    secureKey,
  });
  if (recomputedSignature !== body.signature) {
    throw new FawryChargeError({
      code: "invalid_signature",
      message: "Fawry signature mismatch before request dispatch",
      userMessage: "تعذر تجهيز توقيع الدفع عبر فوري.",
    });
  }

  const sanitizedRequestPayload = {
    ...body,
    customerName: maskMiddle(body.customerName, 2),
    customerMobile: maskMiddle(body.customerMobile, 3),
    customerEmail: maskEmail(body.customerEmail),
  };

  logFawryEvent(warnings.length > 0 ? "warn" : "info", "charge request", {
    endpoint,
    environmentMode: config.sandbox ? "sandbox" : "production",
    merchantCode,
    merchantRefNum,
    amount: paymentAmountText,
    currencyCode: "EGP",
    paymentMethod: body.paymentMethod,
    returnUrl: body.returnUrl,
    customer: {
      name: maskMiddle(body.customerName, 2),
      mobile: maskMiddle(body.customerMobile, 3),
      email: maskEmail(body.customerEmail),
    },
    signature: body.signature,
    rawRequestPayload: sanitizedRequestPayload,
    rawRequestPayloadJson: JSON.stringify(sanitizedRequestPayload),
    warnings,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FAWRY_REQUEST_TIMEOUT_MS);
  let res: Response;
  let rawResponseBody = "";
  try {
    SEEN_MERCHANT_REFS.add(merchantRefNum);
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    rawResponseBody = await res.text();
  } catch (e) {
    const timedOut = e instanceof Error && e.name === "AbortError";
    logFawryEvent("error", timedOut ? "charge timeout" : "charge network error", {
      endpoint,
      merchantRefNum,
      amount: paymentAmountText,
      paymentMethod: body.paymentMethod,
      error: e instanceof Error ? e.message : String(e),
    });
    throw new FawryChargeError({
      code: timedOut ? "network_timeout" : "network_error",
      message: timedOut ? "Fawry request timed out" : "Fawry network request failed",
      userMessage: timedOut
        ? "انتهت مهلة الاتصال بفوري. حاول مرة أخرى."
        : "تعذر الاتصال بفوري حالياً. حاول مرة أخرى.",
      cause: e,
    });
  } finally {
    clearTimeout(timeout);
  }

  let responseJson: unknown;
  try {
    responseJson = rawResponseBody ? JSON.parse(rawResponseBody) : {};
  } catch (e) {
    logFawryEvent("error", "charge non-json response", {
      endpoint,
      merchantRefNum,
      httpStatus: res.status,
      rawResponseBody: rawResponseBody.slice(0, 1000),
    });
    throw new FawryChargeError({
      code: "invalid_response",
      message: "Fawry returned a non-JSON response",
      userMessage: "استجابة فوري غير مفهومة. حاول مرة أخرى لاحقاً.",
      httpStatus: res.status,
      cause: e,
    });
  }

  const parsed = fawryChargeResponseSchema.safeParse(responseJson);
  if (!parsed.success) {
    logFawryEvent("error", "charge invalid response schema", {
      endpoint,
      merchantRefNum,
      httpStatus: res.status,
      rawResponseBody: rawResponseBody.slice(0, 1000),
      parsedJson: responseJson,
      issues: parsed.error.flatten(),
    });
    throw new FawryChargeError({
      code: "invalid_response",
      message: "Fawry response did not match expected schema",
      userMessage: "استجابة فوري غير مكتملة. حاول مرة أخرى لاحقاً.",
      httpStatus: res.status,
    });
  }

  const data = parsed.data;
  logFawryEvent("info", "charge response", {
    endpoint,
    merchantRefNum,
    httpStatus: res.status,
    rawResponseBody: rawResponseBody.slice(0, 2000),
    parsedJson: data,
  });

  if (!res.ok) {
    throw new FawryChargeError({
      code: "fawry_unavailable",
      message: `Fawry API HTTP ${res.status}: ${rawResponseBody.slice(0, 200)}`,
      userMessage: "فوري غير متاح حالياً. حاول مرة أخرى لاحقاً.",
      httpStatus: res.status,
      fawryStatusCode: data.statusCode,
      statusDescription: data.statusDescription,
    });
  }

  if (data.statusCode !== undefined && data.statusCode !== 200) {
    const classified = classifyFawryFailure(data);
    throw new FawryChargeError({
      code: classified.code,
      message: `Fawry charge failed (${data.statusCode}): ${
        data.statusDescription ?? String(data.statusCode)
      }`,
      userMessage: classified.userMessage,
      httpStatus: res.status,
      fawryStatusCode: data.statusCode,
      statusDescription: data.statusDescription,
    });
  }

  const redirectUrl =
    data.redirectUrl ?? data.nextAction?.redirectUrl ?? data.paymentUrl ?? data.paymentURL;

  if (!redirectUrl) {
    logFawryEvent("error", "hosted charge missing payment url", {
      endpoint,
      merchantRefNum,
      httpStatus: res.status,
      statusCode: data.statusCode,
      statusDescription: data.statusDescription,
      parsedJson: data,
      rawResponseBody: rawResponseBody.slice(0, 2000),
    });
    throw new FawryChargeError({
      code: "missing_payment_url",
      message: "Fawry hosted checkout did not return a payment URL",
      userMessage: "لم يتم استلام رابط صفحة الدفع من فوري. حاول مرة أخرى أو اختر طريقة دفع أخرى.",
      httpStatus: res.status,
      fawryStatusCode: data.statusCode,
      statusDescription: data.statusDescription,
    });
  }

  return {
    redirectUrl,
    merchantRefNum,
    paymentMethod: body.paymentMethod,
    referenceNumber: data.referenceNumber,
  };
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
  const numericMatch = /^(\d+)$/.exec(merchantRefNum);
  if (numericMatch) {
    const id = parseInt(numericMatch[1], 10);
    return Number.isFinite(id) ? id : null;
  }
  const match = /^sokany-(\d+)(?:-|$)/.exec(merchantRefNum);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  return Number.isFinite(id) ? id : null;
}
