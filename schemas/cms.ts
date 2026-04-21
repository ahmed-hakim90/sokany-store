import { z } from "zod";

/** Promo strip on home — countdown until `endsAt` (ISO). */
export const cmsPromoFlashSchema = z.object({
  enabled: z.boolean(),
  /** ISO 8601; when null and enabled, UI may fall back to end-of-calendar-day. */
  endsAt: z.union([z.string().datetime({ offset: true }), z.null()]),
  headline: z.string().optional(),
  subline: z.string().optional(),
});

export type CmsPromoFlash = z.infer<typeof cmsPromoFlashSchema>;

/** عنصر شريط الإعلانات فوق الهيدر — نص واحد في السطر، رابط اختياري. */
export const cmsAnnouncementItemSchema = z.object({
  text: z.string().min(1).max(500),
  href: z.string().min(1).optional(),
});

export type CmsAnnouncementItem = z.infer<typeof cmsAnnouncementItemSchema>;

export const cmsTopAnnouncementBarSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(["marquee", "carousel"]),
  /** ثوانٍ بين الشرائح في وضع الكاروسيل (٣–١٢٠). */
  carouselIntervalSec: z.number().min(3).max(120).default(8),
  items: z.array(cmsAnnouncementItemSchema).max(24),
});

export type CmsTopAnnouncementBar = z.infer<typeof cmsTopAnnouncementBarSchema>;

/** قيم افتراضية للوحة التحكم والتهيئة عند غياب الحقل في Firestore. */
export const CMS_DEFAULT_TOP_ANNOUNCEMENT_BAR: CmsTopAnnouncementBar = {
  enabled: false,
  mode: "marquee",
  carouselIntervalSec: 8,
  items: [],
};

/** روابط السوشيال في الفوتر وـ JSON-LD — إن وُجدت في CMS تُستخدم بدل القيم الثابتة. */
export const cmsSocialLinkSchema = z.object({
  key: z.string().min(1).max(32),
  href: z.string().url(),
  label: z.string().min(1).max(64),
});

export type CmsSocialLink = z.infer<typeof cmsSocialLinkSchema>;

/** هوية الموقع — اختياري بالكامل؛ القيم الناقصة تُستبدل من env/ثوابت. */
export const cmsSiteBrandingSchema = z.object({
  siteName: z.string().min(1).max(120).optional(),
  siteBrandTitleAr: z.string().min(1).max(120).optional(),
  siteWordmark: z.string().min(1).max(64).optional(),
  logoPath: z.string().min(1).max(500).optional(),
  logoDisabled: z.boolean().optional(),
  icon192: z.string().min(1).max(500).optional(),
  icon512: z.string().min(1).max(500).optional(),
  pwaName: z.string().min(1).max(120).optional(),
  pwaShortName: z.string().min(1).max(40).optional(),
  pwaDescription: z.string().min(1).max(500).optional(),
  themeColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  defaultMetadataTitle: z.string().min(1).max(200).optional(),
  /** مسار نسبي أو URL مطلق لصورة OG الافتراضية */
  defaultOgImageUrl: z.string().min(1).max(800).optional(),
  organizationName: z.string().min(1).max(200).optional(),
  organizationLogoUrl: z.string().min(1).max(800).optional(),
  supportPhoneDisplay: z.string().min(1).max(80).optional(),
});

export type CmsSiteBranding = z.infer<typeof cmsSiteBrandingSchema>;

/** كلمات البحث السريعة في شريط البحث — تُدار من لوحة التحكم؛ الفارغ يعني استخدام الافتراضي من الكود. */
export const cmsSearchQuickKeywordsSchema = z
  .array(z.string().min(1).max(64))
  .max(40)
  .optional();

export const cmsSiteConfigDocSchema = z.object({
  promoFlash: cmsPromoFlashSchema,
  topAnnouncementBar: cmsTopAnnouncementBarSchema.optional(),
  socialLinks: z.array(cmsSocialLinkSchema).max(12).optional(),
  branding: cmsSiteBrandingSchema.optional(),
  searchQuickKeywords: cmsSearchQuickKeywordsSchema,
  updatedAt: z.unknown().optional(),
});

export type CmsSiteConfigDoc = z.infer<typeof cmsSiteConfigDocSchema>;

export const cmsHeroSlideSchema = z.object({
  /** مسار عام أو URL كامل (مثل رفع Storage). */
  imageUrl: z.string().min(1),
  alt: z.string().optional(),
  href: z.string().optional(),
  order: z.number().int().optional(),
});

export const cmsHomeHeroDocSchema = z.object({
  slides: z.array(cmsHeroSlideSchema),
  /**
   * عند عدم وجود شرائح صالحة في CMS: إن كان `true` أو غير مُعرَّف تُستخدم صور المجلد
   * `public/images/hero`؛ إن كان `false` يُخفى الهيرو على الصفحة الرئيسية.
   */
  useFileFallbackWhenEmpty: z.boolean().optional(),
  updatedAt: z.unknown().optional(),
});

export type CmsHomeHeroDoc = z.infer<typeof cmsHomeHeroDocSchema>;

export const cmsSectionBannerItemSchema = z.object({
  imageUrl: z.string().min(1),
  href: z.string().optional(),
});

export const cmsSectionBannersDocSchema = z.object({
  items: z.array(cmsSectionBannerItemSchema),
  updatedAt: z.unknown().optional(),
});

export type CmsSectionBannersDoc = z.infer<typeof cmsSectionBannersDocSchema>;

export const cmsSalesBranchSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  googleMapsUrl: z.string().url(),
});

export const cmsServiceBranchSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  whatsapp: z.string().min(1),
});

export const cmsBranchesDocSchema = z.object({
  sales: z.array(cmsSalesBranchSchema),
  service: z.array(cmsServiceBranchSchema),
  updatedAt: z.unknown().optional(),
});

export type CmsBranchesDoc = z.infer<typeof cmsBranchesDocSchema>;

export const cmsRetailerSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  governorate: z.string().min(1),
  imageSrc: z.string().min(1),
  phone: z.string().min(1),
  googleMapsUrl: z.string().url().optional(),
});

export const cmsRetailersDocSchema = z.object({
  retailers: z.array(cmsRetailerSchema),
  mapHeroSrc: z.string().min(1),
  updatedAt: z.unknown().optional(),
});

export type CmsRetailersDoc = z.infer<typeof cmsRetailersDocSchema>;

export const cmsSpotlightItemSchema = z.object({
  type: z.enum(["branch", "product"]),
  branchId: z.string().optional(),
  productId: z.number().int().optional(),
  imageUrl: z.string().min(1).optional(),
  href: z.string().optional(),
  active: z.boolean(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
});

export const cmsSpotlightsDocSchema = z.object({
  items: z.array(cmsSpotlightItemSchema),
  updatedAt: z.unknown().optional(),
});

export type CmsSpotlightsDoc = z.infer<typeof cmsSpotlightsDocSchema>;

/** FCM token doc for web subscribers (optional topic subscription). */
export const cmsFcmTokenDocSchema = z.object({
  token: z.string().min(1),
  uid: z.string().optional(),
  createdAt: z.unknown().optional(),
  topics: z.array(z.string()).optional(),
});
