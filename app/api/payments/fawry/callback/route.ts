/**
 * GET  /api/payments/fawry/callback  — إعادة توجيه المتصفح بعد الدفع
 * POST /api/payments/fawry/callback  — IPN (إشعار فوري للخادم)
 *
 * معاملات فوري: orderRefNum, merchantRefNum, paymentAmount, orderStatus, signature, ...
 */
import { NextRequest, NextResponse } from "next/server";
import { resolveFawryConfig } from "@/lib/payment-gateways-store";
import {
  verifyFawryCallbackSignature,
  extractOrderIdFromFawryRef,
} from "@/lib/payment/fawry";
import { createWooClient } from "@/lib/create-woo-client";
import { ROUTES } from "@/lib/constants";
import { toAbsoluteSiteUrl } from "@/lib/site";

function getParams(req: NextRequest): Record<string, string> {
  const out: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

async function handleFawryCallback(
  params: Record<string, string>,
  options: { updateWoo: boolean },
) {
  const config = await resolveFawryConfig();
  if (!config) return { success: false, orderId: null };

  const {
    merchantRefNum,
    orderRefNum,
    paymentAmount,
    orderStatus,
    signature,
  } = params;

  if (!merchantRefNum || !orderRefNum || !orderStatus || !signature || !config.secureKey) {
    return { success: false, orderId: null };
  }

  const orderId = extractOrderIdFromFawryRef(merchantRefNum);

  const valid = verifyFawryCallbackSignature({
    merchantRefNum,
    orderRefNum,
    paymentAmount: paymentAmount ?? "0",
    orderStatus,
    secureKey: config.secureKey,
    signature,
  });
  if (!valid) {
    console.warn("[fawry/callback] invalid signature", { merchantRefNum });
    return { success: false, orderId };
  }

  const paid = orderStatus === "PAID" || orderStatus === "200";

  if (options.updateWoo && paid && orderId) {
    try {
      const woo = await createWooClient();
      await woo.put(`/orders/${orderId}`, {
        status: "processing",
        set_paid: true,
        transaction_id: orderRefNum,
      });
    } catch (e) {
      console.error("[fawry/callback] failed to update woo order", orderId, e);
    }
  }

  return { success: paid, orderId };
}

export async function GET(request: NextRequest) {
  const params = getParams(request);
  const { success, orderId } = await handleFawryCallback(params, { updateWoo: false });

  const confirmationPath =
    orderId != null
      ? `${ROUTES.ORDER_CONFIRMATION}?id=${orderId}&payment=${success ? "success" : "failed"}`
      : `${ROUTES.ORDER_CONFIRMATION}?payment=${success ? "success" : "failed"}`;

  return NextResponse.redirect(toAbsoluteSiteUrl(confirmationPath));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as Record<string, string>;
  const params = { ...getParams(request), ...body };
  const { success, orderId } = await handleFawryCallback(params, { updateWoo: true });
  if (!success) {
    return NextResponse.json({ received: false, success, orderId }, { status: 401 });
  }
  return NextResponse.json({ received: true, success, orderId });
}
