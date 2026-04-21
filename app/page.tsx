import type { Metadata } from "next";
import {
  HomePageContent,
  type HomeBottomPromo,
} from "@/components/pages/HomePageContent";
import {
  getPublicSiteContent,
  getSpotlightsFromFirestore,
} from "@/features/cms/services/getPublicSiteContent";
import { ROUTES } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

const defaultOgImage =
  "https://sokany-eg.com/wp-content/uploads/2022/08/SOKANY-EG-2png.png";

export const metadata: Metadata = {
  title: "سوكانى المغربى | أجهزة كهربائية منزلية ومطبخ",
  description:
    "تسوق أجهزة سوكانى الكهربائية بأفضل الأسعار في مصر. أجهزة مطبخ، منزلية، وعناية شخصية من الوكيل الحصري مؤسسة المغربى.",
  keywords: [
    "سوكانى",
    "أجهزة كهربائية",
    "أجهزة مطبخ",
    "سوكانى مصر",
    "sokany egypt",
  ],
  openGraph: {
    title: "سوكانى المغربى | الوكيل الحصري في مصر",
    description: "أفضل أسعار أجهزة سوكانى الكهربائية في مصر",
    url: getSiteUrl(),
    siteName: "سوكانى المغربى",
    locale: "ar_EG",
    type: "website",
    images: [{ url: defaultOgImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "سوكانى المغربى",
    description: "أجهزة سوكانى الكهربائية من الوكيل الحصري",
    images: [defaultOgImage],
  },
  alternates: { canonical: getSiteUrl() },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const DEFAULT_BOTTOM_PROMO: HomeBottomPromo = {
  eyebrow: "حصرياً",
  title: "مجموعة تحضير القهوة",
  subtitle: "عروض لفترة محدودة على ماكينات القهوة والمطاحن — وفر حتى 40٪.",
  href: ROUTES.CATEGORY("coffee-maker"),
  ctaLabel: "اكتشف الآن",
};

export default async function Home() {
  const [content, spotlights] = await Promise.all([
    getPublicSiteContent(),
    getSpotlightsFromFirestore(),
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
    };
  }

  return (
    <HomePageContent
      heroSlides={content.heroSlides}
      sectionBanners={content.sectionBanners}
      flashSaleSectionEnabled={content.promoFlash.enabled}
      promoFlash={{
        endsAtIso: content.promoFlash.endsAt,
        headline: content.promoFlash.headline,
        subline: content.promoFlash.subline,
      }}
      homeBottomPromo={homeBottomPromo}
    />
  );
}
