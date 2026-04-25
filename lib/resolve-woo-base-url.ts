import "server-only";

import { getCmsStorefrontIntegrationsForServer } from "@/features/cms/services/getCmsStorefrontIntegrationsForServer";

/**
 * أولوية: ‎`WC_BASE_URL` عند الضبط (يتوقع فريق التطوير/النشر) ثم ‎`storefrontIntegrations.wooBaseUrl` في Firestore
 * وإلا ‎`null`‎. المفاتيح (consumer/secret) تبقى في ‎`WC_CONSUMER_*` دائماً.
 */
export async function resolveWooBaseUrlForServer(): Promise<string | null> {
  const fromEnv = process.env.WC_BASE_URL?.trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv).href;
    } catch {
      /* continue to CMS */
    }
  }
  const int = await getCmsStorefrontIntegrationsForServer();
  const fromCms = int?.wooBaseUrl?.trim();
  if (fromCms) {
    try {
      return new URL(fromCms).href;
    } catch {
      return null;
    }
  }
  return null;
}
