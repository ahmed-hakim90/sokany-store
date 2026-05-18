/**
 * GET  /api/payments/paymob/callback  — إعادة توجيه المتصفح بعد الدفع
 * POST /api/payments/paymob/callback  — Transaction webhook من باي موب
 *
 * معاملات باي موب في الـ GET: success, order, transaction, hmac, ...
 * جسم الـ POST: { obj: { success, order: { merchant_order_id }, id, ... } }
 */
import { NextRequest, NextResponse } from "next/server";
import { resolvePaymobConfig } from "@/lib/payment-gateways-store";
import {
  verifyPaymobHmac,
  extractOrderIdFromPaymobRef,
} from "@/lib/payment/paymob";
import { createWooClient } from "@/lib/create-woo-client";
import { ROUTES } from "@/lib/constants";
import { toAbsoluteSiteUrl } from "@/lib/site";

async function markWooOrderPaid(orderId: number, transactionId?: string) {
  try {
    const woo = await createWooClient();
    await woo.put(`/orders/${orderId}`, {
      status: "processing",
      set_paid: true,
      ...(transactionId ? { transaction_id: transactionId } : {}),
    });
  } catch (e) {
    console.error("[paymob/callback] failed to update woo order", orderId, e);
  }
}

function queryParams(request: NextRequest): Record<string, string> {
  const params: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((v, k) => {
    params[k] = v;
  });
  return params;
}

function verifiedPaymobParams(
  config: Awaited<ReturnType<typeof resolvePaymobConfig>>,
  params: Record<string, string>,
): Record<string, string> | null {
  const hmac = params.hmac;
  if (!config?.hmacSecret || !hmac) return null;
  return verifyPaymobHmac(config.hmacSecret, params, hmac) ? params : null;
}

type PaymobWebhookBody = {
  hmac?: string;
  obj?: {
    hmac?: string;
    success?: boolean;
    id?: number;
    amount_cents?: number | string;
    created_at?: string;
    currency?: string;
    error_occured?: boolean;
    has_parent_transaction?: boolean;
    integration_id?: number | string;
    is_3d_secure?: boolean;
    is_auth?: boolean;
    is_capture?: boolean;
    is_refunded?: boolean;
    is_standalone_payment?: boolean;
    is_voided?: boolean;
    owner?: number | string;
    pending?: boolean;
    order?: { merchant_order_id?: string; id?: number | string };
    source_data?: { pan?: string; sub_type?: string; type?: string };
  };
  type?: string;
};

function stringValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function paymobWebhookParams(body: PaymobWebhookBody): Record<string, string> {
  const obj = body.obj;
  if (!obj) return {};
  return {
    amount_cents: stringValue(obj.amount_cents),
    created_at: stringValue(obj.created_at),
    currency: stringValue(obj.currency),
    error_occured: stringValue(obj.error_occured),
    has_parent_transaction: stringValue(obj.has_parent_transaction),
    id: stringValue(obj.id),
    integration_id: stringValue(obj.integration_id),
    is_3d_secure: stringValue(obj.is_3d_secure),
    is_auth: stringValue(obj.is_auth),
    is_capture: stringValue(obj.is_capture),
    is_refunded: stringValue(obj.is_refunded),
    is_standalone_payment: stringValue(obj.is_standalone_payment),
    is_voided: stringValue(obj.is_voided),
    order: stringValue(obj.order?.id),
    owner: stringValue(obj.owner),
    pending: stringValue(obj.pending),
    "source_data.pan": stringValue(obj.source_data?.pan),
    "source_data.sub_type": stringValue(obj.source_data?.sub_type),
    "source_data.type": stringValue(obj.source_data?.type),
    success: stringValue(obj.success),
    hmac: body.hmac ?? obj.hmac ?? "",
  };
}

export async function GET(request: NextRequest) {
  const params = queryParams(request);
  const config = await resolvePaymobConfig();
  const verified = verifiedPaymobParams(config, params);
  const success = verified?.success === "true";
  let orderId: number | null =
    verified?.order != null ? parseInt(verified.order, 10) || null : null;

  if (!verified) {
    console.warn("[paymob/callback] missing or invalid HMAC");
  }

  const confirmationPath =
    orderId != null
      ? `${ROUTES.ORDER_CONFIRMATION}?id=${orderId}&payment=${success ? "success" : "failed"}`
      : `${ROUTES.ORDER_CONFIRMATION}?payment=${success ? "success" : "failed"}`;

  return NextResponse.redirect(toAbsoluteSiteUrl(confirmationPath));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as PaymobWebhookBody;
  const params = { ...paymobWebhookParams(body), ...queryParams(request) };
  const config = await resolvePaymobConfig();
  const verified = verifiedPaymobParams(config, params);
  if (!verified) {
    console.warn("[paymob/callback] rejected webhook without valid HMAC");
    return NextResponse.json({ received: false }, { status: 401 });
  }

  if (body.type === "TRANSACTION" && body.obj) {
    const obj = body.obj;
    if (config && obj.success) {
      const merchantOrderId = obj.order?.merchant_order_id ?? "";
      const orderId = extractOrderIdFromPaymobRef(merchantOrderId);
      if (orderId) await markWooOrderPaid(orderId, String(obj.id ?? ""));
    }
  }

  return NextResponse.json({ received: true });
}
