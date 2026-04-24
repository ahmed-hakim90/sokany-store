import { NextRequest, NextResponse } from "next/server";
import { requireScopeFull } from "@/lib/api-control-auth";
import { signWooCommerceWebhookSignature } from "@/lib/sign-woocommerce-webhook-signature";
import { resolveWooCommerceWebhookUrl } from "@/lib/storefront-origin";

/**
 * ‎POST: يستدعي ‎`POST /api/webhooks/woocommerce` من الخادم بتوقيع ‎HMAC صالح.
 * جسم بسيط ‎`order.*` — لا يُفعّل فحص ‎Zod للمنتج.
 */
export async function POST(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;

  const secret = process.env.WC_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "WC_WEBHOOK_SECRET غير مضبوط" },
      { status: 503 },
    );
  }

  const body = JSON.stringify({ id: 0, number: "health" });
  const signature = signWooCommerceWebhookSignature(body, secret);
  const url = await resolveWooCommerceWebhookUrl();
  const t0 = Date.now();
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-WC-Webhook-Signature": signature,
        "X-WC-Webhook-Topic": "order.updated",
      },
      body,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "fetch failed",
        url,
        latencyMs: Date.now() - t0,
      },
      { status: 200 },
    );
  }

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 500) };
  }

  return NextResponse.json(
    {
      ok: res.ok,
      status: res.status,
      url,
      latencyMs: Date.now() - t0,
      body: json,
    },
    { status: 200 },
  );
}
