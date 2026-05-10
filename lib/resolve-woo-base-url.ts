import "server-only";

/**
 * أصل Woo على السيرفر
 * بالعامية: بنحدد لينك المتجر في Woo منين: الأول env، ولو فاضي بنقرا من إعدادات الـ CMS في Firestore.
 *
 * ملاحظات:
 * - ليه الاتنين: النشر بيحب الـ env، والتحكم من لوحة التحكم يعدّي من غير redeploy.
 * - المفاتيح (consumer/secret) لسه في `WC_CONSUMER_*` — الملف ده بس الـ base URL.
 * - شوف كمان: `@/lib/create-woo-client.ts`
 */
import { getCmsStorefrontIntegrationsForServer } from "@/features/cms/services/getCmsStorefrontIntegrationsForServer";

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
