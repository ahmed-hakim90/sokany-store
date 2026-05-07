import { z } from "zod";
import { ROUTES } from "@/lib/constants";
import { CATEGORY_ICON_SLUGS } from "@/lib/category-icon-slugs";

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
  /** مسار أيقونة Apple (عادة ١٨٠×١٨٠ في `public/`) */
  appleTouchIcon: z.string().min(1).max(500).optional(),
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
  productCardBadgeEnabled: z.boolean().optional(),
  productCardBadgeText: z.string().min(1).max(80).optional(),
});

export type CmsSiteBranding = z.infer<typeof cmsSiteBrandingSchema>;

/** كلمات البحث السريعة في شريط البحث — تُدار من لوحة التحكم؛ الفارغ يعني استخدام الافتراضي من الكود. */
export const cmsSearchQuickKeywordsSchema = z
  .array(z.string().min(1).max(64))
  .max(40)
  .optional();

const cmsHeaderCategoryIconKeySchema = z.enum(
  CATEGORY_ICON_SLUGS as unknown as [string, ...string[]],
);

/** شريط دوائر (أيقونات فقط) تحت شريط الهيدر — يُدار من لوحة التحكم. */
export const cmsHeaderCategoryStripItemSchema = z.object({
  /** مسار داخلي يبدأ بـ `/` (مثال: `/categories/coffee-maker`). */
  href: z
    .string()
    .min(1)
    .max(500)
    .refine(
      (h) => h.startsWith("/") && !h.startsWith("//") && !h.includes(".."),
      "مسار داخلي صالح",
    ),
  /** يطابق مفاتيح `CategoryIcon` في `category-icon-registry`. */
  iconKey: cmsHeaderCategoryIconKeySchema,
  /** وصف قصير لقارئ الشاشة (اختياري). */
  label: z.string().min(1).max(80).optional(),
});

export type CmsHeaderCategoryStripItem = z.infer<typeof cmsHeaderCategoryStripItemSchema>;

export const cmsHeaderCategoryStripSchema = z.object({
  enabled: z.boolean(),
  items: z.array(cmsHeaderCategoryStripItemSchema).max(20),
});

export type CmsHeaderCategoryStrip = z.infer<typeof cmsHeaderCategoryStripSchema>;

/**
 * اختصارات التصنيفات تحت الهيدر — افتراضي مفعّل حتى تظهر الواجهة بدون إعداد Firestore.
 * مُتجاوَز عند وجود ‎`headerCategoryStrip`‎ صالح في ‎`site_config`‎.
 */
export const CMS_DEFAULT_HEADER_CATEGORY_STRIP: CmsHeaderCategoryStrip = {
  enabled: true,
  items: [
    {
      href: ROUTES.CATEGORY("home-appliances"),
      iconKey: "home-appliances",
      label: "أجهزة منزلية",
    },
    {
      href: ROUTES.CATEGORY("kitchen-supplies"),
      iconKey: "kitchen-supplies",
      label: "مطبخ",
    },
    {
      href: ROUTES.CATEGORY("personal-care"),
      iconKey: "personal-care",
      label: "عناية شخصية",
    },
    {
      href: ROUTES.CATEGORY("coffee-maker"),
      iconKey: "coffee-maker",
      label: "قهوة",
    },
  ],
};

const internalPathRefine = (h: string) =>
  h.startsWith("/") && !h.startsWith("//") && !h.includes("..");

/** `site_config.homeCategoryScroller` — ‎`sectionVisible`‎ + ترتيب/تقييد عبر /control؛ الصور من وو (تُلغى البلاطة بلا صورة). */
export const cmsHomeCategoryScrollerItemSchema = z.object({
  /** اختياري: الشريح يستخدم `image` من ووكومرس؛ يُبقى الحقل للوحة أو للتوافق مع بيانات قديمة. */
  imageUrl: z.string().max(800).default(""),
  href: z
    .string()
    .min(1)
    .max(500)
    .refine(internalPathRefine, "مسار داخلي صالح"),
  imageAlt: z.string().min(1).max(200).optional(),
});

export type CmsHomeCategoryScrollerItem = z.infer<typeof cmsHomeCategoryScrollerItemSchema>;

export const cmsHomeCategoryScrollerSchema = z.object({
  /**
   * إظهار سكroller صور التصنيفات تحت الهيرو. المستندات القديمة بلا هذا الحقل تُعامل كـ ‎`true`‎
   * (نفس السلوك قبل إضافة المفتاح).
   */
  sectionVisible: z.boolean().default(true),
  enabled: z.boolean(),
  items: z.array(cmsHomeCategoryScrollerItemSchema).max(24),
});

export type CmsHomeCategoryScroller = z.infer<typeof cmsHomeCategoryScrollerSchema>;

export const CMS_DEFAULT_HOME_CATEGORY_SCROLLER: CmsHomeCategoryScroller = {
  sectionVisible: false,
  enabled: false,
  items: [],
};

export const cmsHomeFeatureVideoPlacementSchema = z.enum([
  "top",
  "afterHero",
  "afterFlashSales",
  "afterServices",
  "afterPromo",
]);

export type CmsHomeFeatureVideoPlacement = z.infer<
  typeof cmsHomeFeatureVideoPlacementSchema
>;

const publicAssetOrUrlSchema = z
  .string()
  .max(800)
  .refine(
    (value) => {
      const t = value.trim();
      if (!t) return true;
      if (t.startsWith("/") && !t.startsWith("//") && !t.includes("..")) return true;
      try {
        const url = new URL(t);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    },
    "استخدم رابط URL صالح أو مسار داخلي يبدأ بـ /",
  );

export const cmsHomeFeatureVideoSchema = z
  .object({
    enabled: z.boolean(),
    videoUrl: publicAssetOrUrlSchema.default(""),
    posterImageUrl: publicAssetOrUrlSchema.default(""),
    placement: cmsHomeFeatureVideoPlacementSchema.default("afterHero"),
  })
  .refine((value) => !value.enabled || value.videoUrl.trim().length > 0, {
    path: ["videoUrl"],
    message: "رابط الفيديو مطلوب عند تفعيل الفيديو",
  });

export type CmsHomeFeatureVideo = z.infer<typeof cmsHomeFeatureVideoSchema>;

export const CMS_DEFAULT_HOME_FEATURE_VIDEO: CmsHomeFeatureVideo = {
  enabled: false,
  videoUrl: "",
  posterImageUrl: "",
  placement: "afterHero",
};

/**
 * `site_config` عبر `safeParse` — `headerCategoryStrip` / `homeCategoryScroller` يُتحققان لاحقاً
 * بـ schemata منفصلة حتى لا تفسد قيمة قديمة باقي الحقول.
 */
/**
 * تكاملات **علنية** فقط. المفاتيح السرية (Woo consumer، أسرار الويبهوك) → `.env` / Vercel وليس Firestore.
 * يُستخرج `publicReadBaseUrl` و`externalDataWebhookUrl` لـ `getPublicSiteContent`.
 * `adminNote` لا يُمرَّر للواجهة العامة — يظهر فقط في لوحة التحكم.
 */
export const cmsStorefrontIntegrationsSchema = z.object({
  /**
   * أصل ووردبرس/وُوكومرس (مثال: ‎`https://shop.example.com`‎) — اختياري.
   * عند التعيين يُستخدم **بدل** ‎`WC_BASE_URL`‎ لطلبات REST من السيرفر. المفاتيح ‎`WC_CONSUMER_*`‎ تبقى في البيئة.
   */
  wooBaseUrl: z.string().url().max(500).optional(),
  /**
   * نطاق واجهة نيكست العلنية (مثال: ‎`https://app.example.com`‎) اختياري.
   * عند التعيين يُبنى منه رابط ‎`POST`‎ لويبهوك وو والبيانات الخارجي (بدل ‎`NEXT_PUBLIC_SITE_URL` / ‎`VERCEL_URL`‎).
   */
  publicStorefrontBaseUrl: z.string().url().max(500).optional(),
  publicReadBaseUrl: z.string().url().max(500).optional(),
  /**
   * رابط HTTPS كامل لـ `POST` ويب هوك البيانات الخارجي (HMAC) — للعرض والنسخ في `/control/woo-api` فقط.
   * ليس بديل `EXTERNAL_DATA_WEBHOOK_SECRET` في env.
   */
  externalDataWebhookUrl: z.string().url().max(500).optional(),
  adminNote: z.string().max(2000).optional(),
});

export type CmsStorefrontIntegrations = z.infer<typeof cmsStorefrontIntegrationsSchema>;

/** وضع أقسام المنتجات على الصفحة الرئيسية: تلقائي / مخصص / الاثنين معاً. */
export const cmsHomeProductSectionsModeSchema = z.enum(["auto", "custom", "hybrid"]);
export type CmsHomeProductSectionsMode = z.infer<typeof cmsHomeProductSectionsModeSchema>;

export const CMS_DEFAULT_HOME_PRODUCT_SECTIONS_MODE: CmsHomeProductSectionsMode = "auto";
export const CMS_MAX_HOME_PRODUCT_SECTIONS = 24;

/** قسم منتجات مخصص على الهوم — البانر إلزامي عند الحفظ؛ العنوان للعميل من اسم التصنيف فقط. */
export const cmsHomeProductSectionSchema = z.object({
  id: z.string().min(1).max(80),
  active: z.boolean(),
  order: z.number().int(),
  categoryId: z.number().int().positive(),
  bannerImageUrl: z.string().min(1).max(800),
  layout: z.enum(["horizontal", "vertical"]),
  productCount: z.number().int().min(1).max(100).default(8),
});

export type CmsHomeProductSection = z.infer<typeof cmsHomeProductSectionSchema>;

export const cmsHomeProductSectionsArraySchema = z
  .array(cmsHomeProductSectionSchema)
  .max(CMS_MAX_HOME_PRODUCT_SECTIONS);

export const CMS_DEFAULT_HOME_PRODUCT_SECTIONS: CmsHomeProductSection[] = [];

export const cmsSiteConfigDocSchema = z.object({
  promoFlash: cmsPromoFlashSchema,
  topAnnouncementBar: cmsTopAnnouncementBarSchema.optional(),
  socialLinks: z.array(cmsSocialLinkSchema).max(12).optional(),
  branding: cmsSiteBrandingSchema.optional(),
  searchQuickKeywords: cmsSearchQuickKeywordsSchema,
  headerCategoryStrip: z.any().optional(),
  homeCategoryScroller: z.any().optional(),
  homeFeatureVideo: cmsHomeFeatureVideoSchema.optional(),
  /** صورة بطاقة الترويج اللي قبل قسم «الأكثر مبيعاً» — لو فاضي يستخدم spotlight أو الصورة الافتراضية. */
  homeBottomPromoImageUrl: publicAssetOrUrlSchema.optional(),
  homeProductSectionsMode: cmsHomeProductSectionsModeSchema.optional(),
  homeProductSections: cmsHomeProductSectionsArraySchema.optional(),
  /** عناوين وقراءة عامة مدارة من `/control` — بلا أسرار. */
  storefrontIntegrations: cmsStorefrontIntegrationsSchema.optional(),
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

/** موضع بطاقة «إعلان مميز» في الصفحة الرئيسية (تبويب إبراز المحتوى). */
export const cmsHomeSpotlightPlacementSchema = z.enum([
  "top",
  "afterHero",
  "afterFlashSales",
  "afterServices",
  "afterBestsellers",
  "afterNewArrivals",
]);

export type CmsHomeSpotlightPlacement = z.infer<
  typeof cmsHomeSpotlightPlacementSchema
>;

export const CMS_DEFAULT_HOME_SPOTLIGHT_PLACEMENT: CmsHomeSpotlightPlacement =
  "afterServices";

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
  homePlacement: cmsHomeSpotlightPlacementSchema.optional(),
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
