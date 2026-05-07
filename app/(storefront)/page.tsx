import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import {
  HomePageContent,
  type HomeBottomPromo,
} from "@/components/pages/HomePageContent";
import { getCategories } from "@/features/categories/services/getCategories";
import {
  getPublicSiteContent,
  getSpotlightsFromFirestore,
} from "@/features/cms/services/getPublicSiteContent";
import { ROUTES, STALE_TIME } from "@/lib/constants";
import { trimMetaDescription } from "@/lib/html";
import { getSiteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await getPublicSiteContent();
  const site = getSiteUrl();
  const title = `${branding.siteBrandTitleAr} | أجهزة كهربائية منزلية ومطبخ`;
  const description = trimMetaDescription(
    branding.pwaDescription ||
      "تسوق أجهزة سوكانى الكهربائية بأفضل الأسعار في مصر. أجهزة مطبخ، منزلية، وعناية شخصية من الوكيل الحصري مؤسسة المغربى.",
  );
  const ogImage = branding.defaultOgImageUrl;
  const ogTitle = `${branding.siteBrandTitleAr} | الوكيل الحصري في مصر`;

  return {
    title,
    description,
    keywords: [
      "سوكانى",
      "أجهزة كهربائية",
      "أجهزة مطبخ",
      "سوكانى مصر",
      "sokany egypt",
      branding.siteBrandTitleAr,
    ],
    openGraph: {
      title: ogTitle,
      description: trimMetaDescription(
        "أفضل أسعار أجهزة سوكانى الكهربائية في مصر",
      ),
      url: site,
      siteName: branding.siteBrandTitleAr,
      locale: "ar_EG",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: branding.siteBrandTitleAr,
      description,
      images: [ogImage],
    },
    alternates: { canonical: site },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

const DEFAULT_BOTTOM_PROMO: HomeBottomPromo = {
  eyebrow: "حصرياً",
  title: "مجموعة تحضير القهوة",
  subtitle: "عروض لفترة محدودة على ماكينات القهوة والمطاحن — وفر حتى 40٪.",
  href: ROUTES.CATEGORY("coffee-maker"),
  ctaLabel: "اكتشف الآن",
};

const HOME_CATEGORIES_QUERY_KEY = ["categories", { per_page: 100 }] as const;

export default async function Home() {
  const queryClient = new QueryClient();
  const [content, spotlights] = await Promise.all([
    getPublicSiteContent(),
    getSpotlightsFromFirestore(),
    queryClient.prefetchQuery({
      queryKey: [...HOME_CATEGORIES_QUERY_KEY],
      queryFn: () => getCategories({ per_page: 100 }),
      staleTime: STALE_TIME.MEDIUM,
    }),
  ]);

  const spotlight = spotlights?.items?.find((i) => i.active);
  let homeBottomPromo: HomeBottomPromo = DEFAULT_BOTTOM_PROMO;
  if (spotlight) {
    const href =
      spotlight.href?.trim() ||
      (spotlight.type === "product" && spotlight.productId != null
        ? ROUTES.PRODUCT(spotlight.productId)
        : spotlight.type === "branch"
          ? ROUTES.SERVICE_CENTERS
          : DEFAULT_BOTTOM_PROMO.href);
    homeBottomPromo = {
      eyebrow: spotlight.title ? "مميز" : DEFAULT_BOTTOM_PROMO.eyebrow,
      title: spotlight.title ?? DEFAULT_BOTTOM_PROMO.title,
      subtitle: spotlight.subtitle ?? DEFAULT_BOTTOM_PROMO.subtitle,
      href,
      ctaLabel: spotlight.ctaLabel ?? "اكتشف الآن",
      imageSrc: spotlight.imageUrl,
      homePlacement: spotlight.homePlacement,
    };
  }
  /*
   * أولوية صورة بطاقة الترويج قبل «الأكثر مبيعاً»:
   * site_config.homeBottomPromoImageUrl  ←  spotlight.imageUrl  ←  الصورة الافتراضية في HomePromoCard.
   */
  if (content.homeBottomPromoImageUrl) {
    homeBottomPromo = {
      ...homeBottomPromo,
      imageSrc: content.homeBottomPromoImageUrl,
    };
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageContent
        heroSlides={content.heroSlides}
        sectionBanners={content.sectionBanners}
        flashSaleSectionEnabled={content.promoFlash.enabled}
        promoFlash={{
          endsAtIso: content.promoFlash.endsAt,
          headline: content.promoFlash.headline,
          subline: content.promoFlash.subline,
        }}
        homeFeatureVideo={content.homeFeatureVideo}
        homeBottomPromo={homeBottomPromo}
        homeCategoryScroller={content.homeCategoryScroller}
        homeProductSectionsMode={content.homeProductSectionsMode}
        homeProductSections={content.homeProductSections}
      />
    </HydrationBoundary>
  );
}
