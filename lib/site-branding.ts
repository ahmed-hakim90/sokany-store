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

/** يطابق `brand-500` / `--color-brand-500` في `app/globals.css` — لون `theme-color` و PWA. */
export const DEFAULT_BRAND_THEME_COLOR = "#daff00";

/** لون سمة قديم كان يُطابق الخلفية الافتراضية — يُستبدل بـ ‎`DEFAULT_BRAND_THEME_COLOR` تلقائياً. */
const LEGACY_BRANDING_THEME_SLATE = "#2f3d4e";

/**
 * لون السمة الظاهر في المتجر (metadata / manifest) — يصحح الفراغ والقيمة الوراثية الرمادية.
 */
export function normalizeStorefrontThemeColor(
  raw: string | undefined | null,
): string {
  const t = raw?.trim();
  if (!t) return DEFAULT_BRAND_THEME_COLOR;
  if (t.toLowerCase() === LEGACY_BRANDING_THEME_SLATE) {
    return DEFAULT_BRAND_THEME_COLOR;
  }
  return t;
}

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
  productCardBadgeEnabled: boolean;
  productCardBadgeText: string;
};

/** دمج حقول الهوية من Firestore مع ثوابت المشروع و`.env`. */
export function resolveSiteBranding(b: CmsSiteBranding | undefined): ResolvedSiteBranding {
  const phoneFromEnv = process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim();
  const siteWordmark = b?.siteWordmark ?? SITE_WORDMARK;
  return {
    siteName: b?.siteName ?? SITE_NAME,
    siteBrandTitleAr: b?.siteBrandTitleAr ?? SITE_BRAND_TITLE_AR,
    siteWordmark,
    logoPath: b?.logoPath ?? SITE_LOGO_PATH,
    logoDisabled: b?.logoDisabled ?? SITE_LOGO_DISABLED,
    icon192: b?.icon192 ?? "/images/icon-192.png",
    icon512: b?.icon512 ?? "/images/icon-512.png",
    appleTouchIcon: b?.appleTouchIcon ?? "/apple-touch-icon.png",
    pwaName: b?.pwaName ?? PWA_INSTALL_NAME,
    pwaShortName: b?.pwaShortName ?? PWA_INSTALL_NAME,
    pwaDescription:
      b?.pwaDescription ?? "متجر أجهزة سوكانى الكهربائية",
    themeColor: normalizeStorefrontThemeColor(b?.themeColor),
    backgroundColor: b?.backgroundColor ?? "#2F3D4E",
    defaultMetadataTitle: b?.defaultMetadataTitle ?? SITE_BRAND_TITLE_AR,
    defaultOgImageUrl: b?.defaultOgImageUrl ?? DEFAULT_OG_IMAGE_URL,
    organizationName: b?.organizationName ?? SITE_BRAND_TITLE_AR,
    organizationLogoUrl: b?.organizationLogoUrl ?? DEFAULT_OG_IMAGE_URL,
    supportPhoneDisplay:
      b?.supportPhoneDisplay ?? phoneFromEnv ?? "+20-xxx-xxx-xxxx",
    productCardBadgeEnabled: b?.productCardBadgeEnabled ?? true,
    productCardBadgeText: b?.productCardBadgeText ?? `Official ${siteWordmark}`,
  };
}
