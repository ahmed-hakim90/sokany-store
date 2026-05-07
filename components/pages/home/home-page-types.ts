import type { HomeHeroSlide } from "@/features/home/components/home-hero-banner";
import type {
  CmsHomeFeatureVideo,
  CmsHomeProductSection,
  CmsHomeProductSectionsMode,
  CmsHomeSpotlightPlacement,
} from "@/schemas/cms";

export type HomeBottomPromo = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  imageSrc?: string;
  /** موضع بطاقة الترويج في عمود الهوم؛ الافتراضي بعد كبسولة الخدمات. */
  homePlacement?: CmsHomeSpotlightPlacement;
};

export type HomePageContentProps = {
  /** Hero من الملفات أو من Firestore. */
  heroSlides?: HomeHeroSlide[];
  /** من الخادم لنصوص ‎`alt`‎ القصيرة عند ربط شرائح الهيرو بمسارات التصنيفات. */
  heroCategoryNamesBySlug?: Record<string, string>;
  /** بانرات أقسام الأب — ترتيب يطابق الفهرس. */
  sectionBanners?: { imageUrl: string; href?: string }[];
  /** إخفاء قسم «عروض سريعة» بالكامل (عداد + شبكة المنتجات المخفّضة). */
  flashSaleSectionEnabled?: boolean;
  /** إعدادات العداد والنصوص من لوحة التحكم. */
  promoFlash?: {
    endsAtIso?: string | null;
    headline?: string;
    subline?: string;
  };
  /** بطاقة الترويج بعد كبسولة الخدمات — افتراضي ثابت أو من spotlight في Firestore. */
  homeBottomPromo?: HomeBottomPromo;
  /** من `site_config` — `false` يخفي البانر الترويجي في كل المواضع. */
  homeBottomPromoVisible?: boolean;
  /** فيديو مميز من لوحة التحكم مع موضع قابل للتغيير. */
  homeFeatureVideo?: CmsHomeFeatureVideo;
  /** من ‎`site_config`‎ — الافتراضي ‎`auto`‎ عند الغياب. */
  homeProductSectionsMode?: CmsHomeProductSectionsMode;
  homeProductSections?: CmsHomeProductSection[];
};
