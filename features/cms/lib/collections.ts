/** Firestore collection for storefront CMS documents (server + control panel). */
export const STOREFRONT_CMS_COLLECTION = "storefront_cms" as const;

export const CMS_DOC_IDS = {
  siteConfig: "site_config",
  homeHero: "home_hero",
  sectionBanners: "section_banners",
  branches: "branches",
  retailers: "retailers",
  spotlights: "spotlights",
} as const;
