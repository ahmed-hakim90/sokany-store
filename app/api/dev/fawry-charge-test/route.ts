import { NextRequest, NextResponse } from "next/server";
import { isDevDiagnosticRequestAllowed } from "@/lib/dev-diagnostic-allow";
import { resolveFawryConfig } from "@/lib/payment-gateways-store";
import { FawryChargeError, initiateFawryCharge } from "@/lib/payment/fawry";
import { toAbsoluteSiteUrl } from "@/lib/site";

/**
 * Dev-only Fawry probe. Allowed in development, or with
 * `Authorization: Bearer DEV_WOO_DIAG_TOKEN` outside development.
 * It logs the full sanitized Fawry request/response via the payment service.
 */
export async function GET(request: NextRequest) {
  if (!isDevDiagnosticRequestAllowed(request)) {
    return new NextResponse(null, { status: 404 });
  }

  const config = await resolveFawryConfig();
  if (!config?.enabled) {
    return NextResponse.json(
      { ok: false, error: "Fawry is not configured or not enabled" },
      { status: 503 },
    );
  }

  const orderId = request.nextUrl.searchParams.get("orderId") ?? "999999";
  const totalRaw = request.nextUrl.searchParams.get("amount") ?? "10.50";
  const total = Number(totalRaw);
  const merchantRefNum = `debug-${orderId}-${Date.now()}`;

  try {
    const result = await initiateFawryCharge(config, {
      merchantRefNum,
      customerName: "Fawry Debug Customer",
      customerMobile: request.nextUrl.searchParams.get("phone") ?? "01000000000",
      customerEmail: request.nextUrl.searchParams.get("email") ?? "fawry-debug@sokany-eg.com",
      chargeItems: [
        {
          itemId: merchantRefNum,
          description: `Fawry debug order ${merchantRefNum}`,
          price: total,
          quantity: 1,
        },
      ],
      returnUrl: toAbsoluteSiteUrl(
        `/api/payments/fawry/callback?ref=${encodeURIComponent(merchantRefNum)}`,
      ),
      ...(config.hostedPaymentMethod ? { paymentMethod: config.hostedPaymentMethod } : {}),
    });
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    if (e instanceof FawryChargeError) {
      return NextResponse.json(
        {
          ok: false,
          code: e.code,
          error: e.message,
          userMessage: e.userMessage,
          httpStatus: e.httpStatus,
          fawryStatusCode: e.fawryStatusCode,
          statusDescription: e.statusDescription,
          classification: e.classification,
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown Fawry debug error" },
      { status: 500 },
    );
  }
}
