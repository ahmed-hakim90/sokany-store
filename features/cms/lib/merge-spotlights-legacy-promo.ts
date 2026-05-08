import type { CmsSpotlightsDoc } from "@/schemas/cms";

function trimPromoImage(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

/**
 * يملأ `homeBottomPromoImageUrl` / `homeBottomPromoVisible` من `site_config` القديم
 * إذا لم تُنقَل بعد إلى وثيقة spotlights.
 */
export function mergeSpotlightsDocWithLegacySitePromo(
  doc: CmsSpotlightsDoc,
  siteRaw: unknown,
): CmsSpotlightsDoc {
  const site =
    siteRaw && typeof siteRaw === "object"
      ? (siteRaw as Record<string, unknown>)
      : null;
  if (!site) return doc;

  const docImage = trimPromoImage(doc.homeBottomPromoImageUrl);
  const legacyImage = trimPromoImage(site.homeBottomPromoImageUrl);

  const homeBottomPromoImageUrl = docImage ?? legacyImage;

  const homeBottomPromoVisible =
    doc.homeBottomPromoVisible !== undefined
      ? doc.homeBottomPromoVisible
      : site.homeBottomPromoVisible === false
        ? false
        : undefined;

  return {
    ...doc,
    homeBottomPromoImageUrl,
    homeBottomPromoVisible,
  };
}
