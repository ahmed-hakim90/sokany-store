import type { CmsSiteConfigDoc, CmsStorefrontIntegrations } from "@/schemas/cms";
import {
  CMS_DEFAULT_HOME_CATEGORY_SCROLLER,
  CMS_DEFAULT_HOME_FEATURE_VIDEO,
  CMS_DEFAULT_HOME_PRODUCT_SECTIONS,
  CMS_DEFAULT_HOME_PRODUCT_SECTIONS_MODE,
  CMS_DEFAULT_HEADER_CATEGORY_STRIP,
  CMS_DEFAULT_TOP_ANNOUNCEMENT_BAR,
  cmsHomeProductSectionsArraySchema,
  cmsSiteConfigDocSchema,
} from "@/schemas/cms";

export function mergeStorefrontIntegrations(
  current: CmsStorefrontIntegrations | undefined,
  patch: Partial<CmsStorefrontIntegrations> | undefined,
): CmsStorefrontIntegrations | undefined {
  if (patch === undefined) {
    return current;
  }
  const merged: CmsStorefrontIntegrations = {
    ...current,
    ...patch,
  };
  const hasWooBase = Boolean(merged.wooBaseUrl?.trim());
  const hasStorefront = Boolean(merged.publicStorefrontBaseUrl?.trim());
  const hasReadUrl = Boolean(merged.publicReadBaseUrl?.trim());
  const hasExternalDataWebhook = Boolean(merged.externalDataWebhookUrl?.trim());
  const hasNote = Boolean(merged.adminNote?.trim());
  if (
    !hasWooBase &&
    !hasStorefront &&
    !hasReadUrl &&
    !hasExternalDataWebhook &&
    !hasNote
  ) {
    return undefined;
  }
  return {
    wooBaseUrl: hasWooBase ? merged.wooBaseUrl?.trim() : undefined,
    publicStorefrontBaseUrl: hasStorefront
      ? merged.publicStorefrontBaseUrl?.trim()
      : undefined,
    publicReadBaseUrl: hasReadUrl
      ? merged.publicReadBaseUrl?.trim()
      : undefined,
    externalDataWebhookUrl: hasExternalDataWebhook
      ? merged.externalDataWebhookUrl?.trim()
      : undefined,
    adminNote: hasNote ? merged.adminNote?.trim() : undefined,
  };
}

export function mergeSiteConfigPatch(
  current: Partial<CmsSiteConfigDoc> | null | undefined,
  patch: Partial<CmsSiteConfigDoc>,
): CmsSiteConfigDoc {
  return cmsSiteConfigDocSchema.parse({
    promoFlash:
      patch.promoFlash ??
      current?.promoFlash ?? {
        enabled: true,
        endsAt: null,
        headline: undefined,
        subline: undefined,
      },
    topAnnouncementBar:
      patch.topAnnouncementBar ??
      current?.topAnnouncementBar ??
      CMS_DEFAULT_TOP_ANNOUNCEMENT_BAR,
    socialLinks: patch.socialLinks ?? current?.socialLinks,
    branding:
      patch.branding !== undefined ? patch.branding : current?.branding,
    searchQuickKeywords:
      patch.searchQuickKeywords !== undefined
        ? patch.searchQuickKeywords
        : current?.searchQuickKeywords,
    headerCategoryStrip:
      patch.headerCategoryStrip !== undefined
        ? patch.headerCategoryStrip
        : current?.headerCategoryStrip ?? CMS_DEFAULT_HEADER_CATEGORY_STRIP,
    homeCategoryScroller:
      patch.homeCategoryScroller !== undefined
        ? patch.homeCategoryScroller
        : current?.homeCategoryScroller ?? CMS_DEFAULT_HOME_CATEGORY_SCROLLER,
    homeFeatureVideo:
      patch.homeFeatureVideo !== undefined
        ? patch.homeFeatureVideo
        : current?.homeFeatureVideo ?? CMS_DEFAULT_HOME_FEATURE_VIDEO,
    homeBottomPromoImageUrl:
      patch.homeBottomPromoImageUrl !== undefined
        ? patch.homeBottomPromoImageUrl
        : current?.homeBottomPromoImageUrl,
    homeProductSectionsMode:
      patch.homeProductSectionsMode ??
      current?.homeProductSectionsMode ??
      CMS_DEFAULT_HOME_PRODUCT_SECTIONS_MODE,
    homeProductSections: cmsHomeProductSectionsArraySchema.parse(
      patch.homeProductSections !== undefined
        ? patch.homeProductSections
        : (current?.homeProductSections ?? CMS_DEFAULT_HOME_PRODUCT_SECTIONS),
    ),
    storefrontIntegrations: mergeStorefrontIntegrations(
      current?.storefrontIntegrations,
      patch.storefrontIntegrations,
    ),
  });
}
