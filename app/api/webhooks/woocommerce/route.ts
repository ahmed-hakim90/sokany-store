import { NextResponse } from "next/server";
import { revalidateAfterProductWebhook } from "@/features/woocommerce/revalidate-after-product-webhook";
import { verifyWooCommerceWebhookSignature } from "@/lib/verify-woocommerce-webhook-signature";

function extractProductId(body: unknown): number | undefined {
  if (!body || typeof body !== "object") return undefined;
  const id = (body as { id?: unknown }).id;
  if (typeof id === "number" && Number.isFinite(id)) return id;
  if (typeof id === "string") {
    const n = Number(id);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export async function POST(request: Request) {
  const secret = process.env.WC_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret is not configured (WC_WEBHOOK_SECRET)" },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-wc-webhook-signature");

  if (!verifyWooCommerceWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = rawBody.length ? JSON.parse(rawBody) : null;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const topic = request.headers.get("x-wc-webhook-topic");
  const productId = extractProductId(payload);

  try {
    revalidateAfterProductWebhook(productId);
  } catch (err) {
    console.error("[woocommerce-webhook] revalidatePath failed", err);
    return NextResponse.json(
      { error: "Cache revalidation failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    topic,
    productId: productId ?? null,
  });
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
