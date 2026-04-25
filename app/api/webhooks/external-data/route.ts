import { NextResponse } from "next/server";
import { EXTERNAL_DATA_WEBHOOK_SIGNATURE_HEADER_DEFAULT } from "@/lib/external-data-webhook-constants";
import { revalidateAfterExternalDataWebhook } from "@/lib/woocommerce-revalidate-broadcast";
import { verifyHmacSha256Base64Body } from "@/lib/verify-hmac-sha256-body-base64";

function getExternalDataSignatureHeaderName(): string {
  return (
    process.env.EXTERNAL_DATA_WEBHOOK_HEADER?.trim() ||
    EXTERNAL_DATA_WEBHOOK_SIGNATURE_HEADER_DEFAULT
  );
}

export async function POST(request: Request) {
  const secret = process.env.EXTERNAL_DATA_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      {
        error:
          "Webhook secret is not configured (EXTERNAL_DATA_WEBHOOK_SECRET)",
      },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const headerName = getExternalDataSignatureHeaderName();
  const signature = request.headers.get(headerName);

  if (!verifyHmacSha256Base64Body(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    revalidateAfterExternalDataWebhook();
  } catch (err) {
    console.error("[external-data-webhook] revalidate failed", err);
    return NextResponse.json(
      { error: "Cache revalidation failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
