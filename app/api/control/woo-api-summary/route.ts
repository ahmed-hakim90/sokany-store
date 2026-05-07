import { NextRequest, NextResponse } from "next/server";
import { requireScopeFull } from "@/lib/api-control-auth";
import { getPublicSiteContent } from "@/features/cms/services/getPublicSiteContent";
import {
  resolveExternalDataWebhookUrl,
  resolveWooCommerceWebhookUrl,
} from "@/lib/storefront-origin";
import { getWooDiagnosticReport } from "@/lib/woo-diagnostics";

export const runtime = "nodejs";

/**
 * ملخص لوحة /control/woo-api كـAPI، حتى يستطيع تبويب «الربط»
 * (داخل /control) يجلب نفس البيانات من العميل بدون تكرار صفحة كاملة.
 */
export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;

  const [report, site, webhookEndpointUrl, externalDataResolved] =
    await Promise.all([
      getWooDiagnosticReport(),
      getPublicSiteContent(),
      resolveWooCommerceWebhookUrl(),
      resolveExternalDataWebhookUrl(),
    ]);

  return NextResponse.json({
    report,
    publicReadBaseUrl: site.publicReadBaseUrl,
    cmsWooBaseUrl: site.cmsWooBaseUrl,
    cmsPublicStorefrontBaseUrl: site.cmsPublicStorefrontBaseUrl,
    cmsExternalDataWebhookUrl: site.externalDataWebhookUrl,
    webhookEndpointUrl,
    externalDataWebhookUrl: site.externalDataWebhookUrl ?? externalDataResolved,
  });
}
