import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { HomePageShell, type HomeBottomPromo } from "@/components/pages/home/HomePageShell";
import { getCategoriesServer } from "@/features/categories/services/getCategoriesServer";
import {
  getPublicSiteContent,
  getSpotlightsFromFirestore,
} from "@/features/cms/services/getPublicSiteContent";
import {
  HOME_CATEGORIES_QUERY_PARAMS,
  homeEagerRailParams,
} from "@/features/home/lib/home-page-product-params";
import type { ProductsQueryData } from "@/features/products/hooks/useProducts";
import { getProductsListServer } from "@/features/products/services/getProductsServer";
import { ROUTES, STALE_TIME } from "@/lib/constants";
import { trimMetaDescription } from "@/lib/html";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 300;

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

function toProductsQueryData(r: {
  products: ProductsQueryData["items"];
  total: number;
  totalPages: number;
}): ProductsQueryData {
  return {
    items: r.products,
    total: r.total,
    totalPages: r.totalPages,
  };
}

export default async function Home() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: STALE_TIME.MEDIUM },
    },
  });

  const [content, spotlights, categoriesData] = await Promise.all([
    getPublicSiteContent(),
    getSpotlightsFromFirestore(),
    getCategoriesServer(HOME_CATEGORIES_QUERY_PARAMS),
  ]);

  const eagerParams = homeEagerRailParams(content.promoFlash.enabled);
  const eagerList = await getProductsListServer(eagerParams);

  queryClient.setQueryData(
    ["products", eagerParams],
    toProductsQueryData(eagerList),
  );

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
   * spotlights.homeBottomPromoImageUrl  ←  أول إعلان نشط (imageUrl)  ←  الافتراضي في HomePromoCard.
   * الإظهار: spotlights.homeBottomPromoVisible === false يخفي البانر بالكامل.
   */
  const promoImageOverride = spotlights?.homeBottomPromoImageUrl?.trim();
  if (promoImageOverride) {
    homeBottomPromo = {
      ...homeBottomPromo,
      imageSrc: promoImageOverride,
    };
  }

  const homeBottomPromoVisible = spotlights?.homeBottomPromoVisible !== false;

  const heroCategoryNamesBySlug = Object.fromEntries(
    categoriesData.map((c) => [c.slug, c.name]),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageShell
        heroSlides={content.heroSlides}
        heroCategoryNamesBySlug={heroCategoryNamesBySlug}
        sectionBanners={content.sectionBanners}
        flashSaleSectionEnabled={content.promoFlash.enabled}
        promoFlash={{
          endsAtIso: content.promoFlash.endsAt,
          headline: content.promoFlash.headline,
          subline: content.promoFlash.subline,
        }}
        homeFeatureVideo={content.homeFeatureVideo}
        homeBottomPromoVisible={homeBottomPromoVisible}
        homeBottomPromo={homeBottomPromo}
        homeProductSectionsMode={content.homeProductSectionsMode}
        homeProductSections={content.homeProductSections}
      />
    </HydrationBoundary>
  );
}
