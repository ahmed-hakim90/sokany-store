import {
  PWA_INSTALL_NAME,
  SITE_BRAND_TITLE_AR,
  SITE_LOGO_DISABLED,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_WORDMARK,
} from "@/lib/constants";
import type { CmsSiteBranding } from "@/schemas/cms";

/** صورة OG الافتراضية في الكود — تُستبدل من CMS عند التعبئة. */
export const DEFAULT_OG_IMAGE_URL =
  "https://sokany-eg.com/wp-content/uploads/2022/08/SOKANY-EG-2png.png";

export type ResolvedSiteBranding = {
  siteName: string;
  siteBrandTitleAr: string;
  siteWordmark: string;
  logoPath: string;
  logoDisabled: boolean;
  icon192: string;
  icon512: string;
  appleTouchIcon: string;
  pwaName: string;
  pwaShortName: string;
  pwaDescription: string;
  themeColor: string;
  backgroundColor: string;
  defaultMetadataTitle: string;
  defaultOgImageUrl: string;
  organizationName: string;
  organizationLogoUrl: string;
  supportPhoneDisplay: string;
};

/** دمج حقول الهوية من Firestore مع ثوابت المشروع و`.env`. */
export function resolveSiteBranding(b: CmsSiteBranding | undefined): ResolvedSiteBranding {
  const phoneFromEnv = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim();
  return {
    siteName: b?.siteName ?? SITE_NAME,
    siteBrandTitleAr: b?.siteBrandTitleAr ?? SITE_BRAND_TITLE_AR,
    siteWordmark: b?.siteWordmark ?? SITE_WORDMARK,
    logoPath: b?.logoPath ?? SITE_LOGO_PATH,
    logoDisabled: b?.logoDisabled ?? SITE_LOGO_DISABLED,
    icon192: b?.icon192 ?? "/images/icon-192.png",
    icon512: b?.icon512 ?? "/images/icon-512.png",
    appleTouchIcon: b?.appleTouchIcon ?? "/apple-touch-icon.png",
    pwaName: b?.pwaName ?? PWA_INSTALL_NAME,
    pwaShortName: b?.pwaShortName ?? PWA_INSTALL_NAME,
    pwaDescription:
      b?.pwaDescription ?? "متجر أجهزة سوكانى الكهربائية",
    themeColor: b?.themeColor ?? "#2F3D4E",
    backgroundColor: b?.backgroundColor ?? "#2F3D4E",
    defaultMetadataTitle: b?.defaultMetadataTitle ?? SITE_BRAND_TITLE_AR,
    defaultOgImageUrl: b?.defaultOgImageUrl ?? DEFAULT_OG_IMAGE_URL,
    organizationName: b?.organizationName ?? SITE_BRAND_TITLE_AR,
    organizationLogoUrl: b?.organizationLogoUrl ?? DEFAULT_OG_IMAGE_URL,
    supportPhoneDisplay:
      b?.supportPhoneDisplay ?? phoneFromEnv ?? "+20-xxx-xxx-xxxx",
  };
}
