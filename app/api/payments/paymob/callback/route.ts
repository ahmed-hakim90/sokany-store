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

export async function GET(request: NextRequest) {
  const params: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((v, k) => {
    params[k] = v;
  });

  const config = await resolvePaymobConfig();
  const success = params.success === "true";
  let orderId: number | null = null;

  if (config?.hmacSecret && params.hmac) {
    const valid = verifyPaymobHmac(config.hmacSecret, params, params.hmac);
    if (!valid) {
      console.warn("[paymob/callback] invalid HMAC");
    }
  }

  if (success && params.order) {
    orderId = extractOrderIdFromPaymobRef(`sokany-${params.order}`);
    if (!orderId) {
      orderId = parseInt(params.order, 10) || null;
    }
    if (orderId) await markWooOrderPaid(orderId, params.transaction ?? undefined);
  }

  const confirmationPath =
    orderId != null
      ? `${ROUTES.ORDER_CONFIRMATION}?id=${orderId}&payment=${success ? "success" : "failed"}`
      : `${ROUTES.ORDER_CONFIRMATION}?payment=${success ? "success" : "failed"}`;

  return NextResponse.redirect(toAbsoluteSiteUrl(confirmationPath));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as {
    obj?: {
      success?: boolean;
      id?: number;
      order?: { merchant_order_id?: string; id?: number };
    };
    type?: string;
  };

  if (body.type === "TRANSACTION" && body.obj) {
    const obj = body.obj;
    const config = await resolvePaymobConfig();
    if (config && obj.success) {
      const merchantOrderId = obj.order?.merchant_order_id ?? "";
      const orderId = extractOrderIdFromPaymobRef(merchantOrderId);
      if (orderId) await markWooOrderPaid(orderId, String(obj.id ?? ""));
    }
  }

  return NextResponse.json({ received: true });
}
