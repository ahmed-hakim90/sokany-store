import { NextRequest, NextResponse } from "next/server";
import { requireFullControlSession } from "@/lib/api-control-auth";
import {
  listSokanyWooWebhooksOnStore,
  syncSokanyWebhooksToWoo,
} from "@/features/woocommerce/services/sync-woo-webhooks";
import { SOKANY_WOO_WEBHOOK_RECIPES } from "@/features/woocommerce/woo-webhook-topics";

function isWooConfigured(): boolean {
  return Boolean(
    process.env.WC_BASE_URL?.trim() &&
      process.env.WC_CONSUMER_KEY?.trim() &&
      process.env.WC_CONSUMER_SECRET?.trim(),
  );
}

/**
 * GET: عرض Webhooks المرتبطة بعنوان التوصيل الحالي + القائمة المقترحة.
 * POST: إنشاء/تفعيل الناقص من ‎`SOKANY_WOO_WEBHOOK_RECIPES`‎.
 */
export async function GET(request: NextRequest) {
  const auth = await requireFullControlSession(request);
  if (auth instanceof NextResponse) return auth;
  if (!isWooConfigured()) {
    return NextResponse.json(
      { error: "WooCommerce غير مُكوّن (WC_BASE_URL, …)" },
      { status: 503 },
    );
  }
  try {
    const { deliveryUrl, sokanyWebhooks, allCount } =
      await listSokanyWooWebhooksOnStore();
    return NextResponse.json({
      ok: true,
      deliveryUrl,
      hasWebhookSecret: Boolean(process.env.WC_WEBHOOK_SECRET?.trim()),
      sokanyWebhooks,
      allCount,
      recipes: SOKANY_WOO_WEBHOOK_RECIPES,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Read failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireFullControlSession(request);
  if (auth instanceof NextResponse) return auth;
  if (!isWooConfigured()) {
    return NextResponse.json(
      { error: "WooCommerce غير مُكوّن (WC_BASE_URL, …)" },
      { status: 503 },
    );
  }
  if (!process.env.WC_WEBHOOK_SECRET?.trim()) {
    return NextResponse.json(
      { error: "أضف WC_WEBHOOK_SECRET في البيئة (نفس القيمة في ووردبريس لكل Webhook)" },
      { status: 400 },
    );
  }
  try {
    const result = await syncSokanyWebhooksToWoo();
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
