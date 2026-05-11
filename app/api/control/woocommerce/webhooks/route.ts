import { NextRequest, NextResponse } from "next/server";
import { requireScopeFull } from "@/lib/api-control-auth";
import {
  listSokanyWooWebhooksOnStore,
  syncSokanyWebhooksToWoo,
} from "@/features/woocommerce/services/sync-woo-webhooks";
import { SOKANY_WOO_WEBHOOK_RECIPES } from "@/features/woocommerce/woo-webhook-topics";
import { resolveWooBaseUrlForServer } from "@/lib/resolve-woo-base-url";
import { resolveWooCredentialsForServer } from "@/lib/woo-credentials-store";

async function isWooConfigured(): Promise<boolean> {
  const [baseUrl, credentials] = await Promise.all([
    resolveWooBaseUrlForServer(),
    resolveWooCredentialsForServer().catch(() => null),
  ]);
  return Boolean(baseUrl?.trim() && credentials);
}

/**
 * GET: عرض Webhooks المرتبطة بعنوان التوصيل الحالي + القائمة المقترحة.
 * POST: إنشاء/تفعيل الناقص من ‎`SOKANY_WOO_WEBHOOK_RECIPES`‎.
 */
export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;
  if (!(await isWooConfigured())) {
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
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;
  if (!(await isWooConfigured())) {
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
