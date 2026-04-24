import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getControlSessionUser } from "@/lib/get-control-session-for-page";
import { getPublicSiteContent } from "@/features/cms/services/getPublicSiteContent";
import {
  resolveExternalDataWebhookUrl,
  resolveWooCommerceWebhookUrl,
} from "@/lib/storefront-origin";
import { getWooDiagnosticReport } from "@/lib/woo-diagnostics";
import { WooApiDashboard } from "./woo-api-dashboard";

export const metadata: Metadata = {
  title: "Woo & API",
  robots: { index: false, follow: false },
};

export default async function ControlWooApiPage() {
  const user = await getControlSessionUser();
  if (!user) {
    redirect("/control/login");
  }

  const [report, site, webhookEndpointUrl, externalDataResolved] =
    await Promise.all([
      getWooDiagnosticReport(),
      getPublicSiteContent(),
      resolveWooCommerceWebhookUrl(),
      resolveExternalDataWebhookUrl(),
    ]);

  const externalDataWebhookUrl =
    site.externalDataWebhookUrl ?? externalDataResolved;

  return (
    <div className="min-h-dvh w-full flex-1 bg-[#f6f9fc]">
      <WooApiDashboard
        report={report}
        publicReadBaseUrl={site.publicReadBaseUrl}
        cmsWooBaseUrl={site.cmsWooBaseUrl}
        cmsPublicStorefrontBaseUrl={site.cmsPublicStorefrontBaseUrl}
        cmsExternalDataWebhookUrl={site.externalDataWebhookUrl}
        webhookEndpointUrl={webhookEndpointUrl}
        externalDataWebhookUrl={externalDataWebhookUrl}
      />
    </div>
  );
}
