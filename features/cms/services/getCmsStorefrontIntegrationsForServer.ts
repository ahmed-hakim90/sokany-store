import "server-only";

import { unstable_cache } from "next/cache";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { CMS_DOC_IDS, STOREFRONT_CMS_COLLECTION } from "@/features/cms/lib/collections";
import { cmsStorefrontIntegrationsSchema, type CmsStorefrontIntegrations } from "@/schemas/cms";

/** نفس قيمة ‎`CMS_CACHE_TAG` في ‎`getPublicSiteContent` — يجب أن تبقى متطابقة. */
const CMS_CACHE_TAG = "storefront-cms";

/**
 * وثيقة ‎`site_config` فقط — نفس ‎`tags`‎ لباقي الـ CMS حتى ‎`revalidateTag`‎ يلغي الكاش.
 */
export async function getCmsStorefrontIntegrationsForServer(): Promise<CmsStorefrontIntegrations | null> {
  return getCachedCmsStorefrontIntegrations();
}

const getCachedCmsStorefrontIntegrations = unstable_cache(
  async (): Promise<CmsStorefrontIntegrations | null> => {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
      return null;
    }
    try {
      const db = getAdminFirestore();
      const snap = await db
        .collection(STOREFRONT_CMS_COLLECTION)
        .doc(CMS_DOC_IDS.siteConfig)
        .get();
      if (!snap.exists) return null;
      const raw = (snap.data() as { storefrontIntegrations?: unknown })
        .storefrontIntegrations;
      const parsed = cmsStorefrontIntegrationsSchema.safeParse(raw ?? undefined);
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  },
  ["cms-storefront-integrations-v1"],
  { revalidate: 60, tags: [CMS_CACHE_TAG] },
);
