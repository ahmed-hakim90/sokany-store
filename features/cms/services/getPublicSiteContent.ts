import "server-only";

import { unstable_cache } from "next/cache";
import { getBannerSectionOrderedImages } from "@/features/home/services/getBannerSectionOrderedImages";
import { getHeroSlides } from "@/features/home/services/getHeroSlides";
import { CMS_DOC_IDS, STOREFRONT_CMS_COLLECTION } from "@/features/cms/lib/collections";
import { branchesData } from "@/features/branches/data";
import {
  authorizedRetailers,
  retailersMapHeroSrc,
} from "@/features/retailers/data";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { DEFAULT_SEARCH_QUICK_KEYWORDS } from "@/lib/search-quick-keywords";
import { resolveSiteBranding, type ResolvedSiteBranding } from "@/lib/site-branding";
import { SOCIAL_LINKS, type SocialLink } from "@/lib/social-links";
import type { HomeHeroSlide } from "@/features/home/components/home-hero-banner";
import type { AuthorizedRetailer } from "@/features/retailers/data";
import type { SalesBranch, ServiceBranch } from "@/features/branches/data";
import {
  cmsBranchesDocSchema,
  cmsHomeHeroDocSchema,
  cmsRetailersDocSchema,
  cmsSectionBannersDocSchema,
  cmsSiteConfigDocSchema,
  cmsSpotlightsDocSchema,
  type CmsPromoFlash,
  type CmsTopAnnouncementBar,
  type CmsSiteBranding,
} from "@/schemas/cms";

export const CMS_CACHE_TAG = "storefront-cms";

export type PublicBranchesData = {
  sales: SalesBranch[];
  service: ServiceBranch[];
};

export type PublicSiteContent = {
  source: "firestore" | "fallback";
  promoFlash: CmsPromoFlash;
  /** شريط إعلان فوق الهيدر (مارquee / كاروسيل). */
  topAnnouncementBar: CmsTopAnnouncementBar;
  /** روابط السوشيال — من CMS أو الافتراضي في `lib/social-links`. */
  socialLinks: SocialLink[];
  /** هوية الظهور — مدموجة من CMS + env/ثوابت. */
  branding: ResolvedSiteBranding;
  heroSlides: HomeHeroSlide[];
  /** Per parent-category section index — image + optional link. */
  sectionBanners: { imageUrl: string; href?: string }[];
  branches: PublicBranchesData;
  retailers: { list: AuthorizedRetailer[]; mapHeroSrc: string };
  /** كلمات البحث السريعة في الهيدر — من CMS أو `DEFAULT_SEARCH_QUICK_KEYWORDS`. */
  searchQuickKeywords: string[];
};

function defaultPromoFlash(): CmsPromoFlash {
  return {
    enabled: true,
    endsAt: null,
    headline: undefined,
    subline: undefined,
  };
}

function mergePromo(
  parsed: CmsPromoFlash | undefined,
  fallback: CmsPromoFlash,
): CmsPromoFlash {
  if (!parsed) return fallback;
  return {
    enabled: parsed.enabled,
    endsAt: parsed.endsAt ?? null,
    headline: parsed.headline !== undefined ? parsed.headline : fallback.headline,
    subline: parsed.subline !== undefined ? parsed.subline : fallback.subline,
  };
}

function defaultTopAnnouncementBar(): CmsTopAnnouncementBar {
  return {
    enabled: false,
    mode: "marquee",
    carouselIntervalSec: 8,
    items: [],
  };
}

function mergeTopAnnouncementBar(
  parsed: CmsTopAnnouncementBar | undefined,
  fallback: CmsTopAnnouncementBar,
): CmsTopAnnouncementBar {
  if (!parsed) return fallback;
  return {
    enabled: parsed.enabled,
    mode: parsed.mode,
    carouselIntervalSec: parsed.carouselIntervalSec ?? 8,
    items: Array.isArray(parsed.items) ? parsed.items : fallback.items,
  };
}

function mergeSocialLinks(parsed: SocialLink[] | undefined): SocialLink[] {
  if (parsed && parsed.length > 0) {
    return parsed.map((s) => ({
      key: s.key,
      href: s.href,
      label: s.label,
    }));
  }
  return SOCIAL_LINKS.map((s) => ({ ...s }));
}

function mergeSearchQuickKeywords(
  parsed: string[] | undefined,
  fallback: string[],
): string[] {
  if (parsed && parsed.length > 0) return [...parsed];
  return fallback;
}

function mapHeroFromCms(
  slides: { imageUrl: string; alt?: string; href?: string }[],
): HomeHeroSlide[] {
  return slides.map((s) => ({
    imageSrc: s.imageUrl,
    imageAlt: s.alt,
    href: s.href,
  }));
}

async function fetchPublicSiteContentUncached(): Promise<PublicSiteContent> {
  const [fsHero, fsSectionUrls] = await Promise.all([
    getHeroSlides(),
    getBannerSectionOrderedImages(),
  ]);
  const fsSectionBanners = fsSectionUrls.map((url) => ({ imageUrl: url }));

  const staticBundle: PublicSiteContent = {
    source: "fallback",
    promoFlash: defaultPromoFlash(),
    topAnnouncementBar: defaultTopAnnouncementBar(),
    socialLinks: mergeSocialLinks(undefined),
    branding: resolveSiteBranding(undefined),
    heroSlides: fsHero,
    sectionBanners: fsSectionBanners,
    branches: {
      sales: [...branchesData.sales],
      service: [...branchesData.service],
    },
    retailers: {
      list: [...authorizedRetailers],
      mapHeroSrc: retailersMapHeroSrc,
    },
    searchQuickKeywords: [...DEFAULT_SEARCH_QUICK_KEYWORDS],
  };

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return staticBundle;
  }

  try {
    const db = getAdminFirestore();
    const col = db.collection(STOREFRONT_CMS_COLLECTION);

    const [siteSnap, heroSnap, sectionSnap, branchesSnap, retailersSnap] =
      await Promise.all([
        col.doc(CMS_DOC_IDS.siteConfig).get(),
        col.doc(CMS_DOC_IDS.homeHero).get(),
        col.doc(CMS_DOC_IDS.sectionBanners).get(),
        col.doc(CMS_DOC_IDS.branches).get(),
        col.doc(CMS_DOC_IDS.retailers).get(),
      ]);

    const siteParsed = siteSnap.exists
      ? cmsSiteConfigDocSchema.safeParse(siteSnap.data())
      : null;
    const heroParsed = heroSnap.exists
      ? cmsHomeHeroDocSchema.safeParse(heroSnap.data())
      : null;
    const sectionParsed = sectionSnap.exists
      ? cmsSectionBannersDocSchema.safeParse(sectionSnap.data())
      : null;
    const branchesParsed = branchesSnap.exists
      ? cmsBranchesDocSchema.safeParse(branchesSnap.data())
      : null;
    const retailersParsed = retailersSnap.exists
      ? cmsRetailersDocSchema.safeParse(retailersSnap.data())
      : null;

    const promoFlash = mergePromo(
      siteParsed?.success ? siteParsed.data.promoFlash : undefined,
      staticBundle.promoFlash,
    );

    const topAnnouncementBar = mergeTopAnnouncementBar(
      siteParsed?.success ? siteParsed.data.topAnnouncementBar : undefined,
      staticBundle.topAnnouncementBar,
    );

    const socialLinks = mergeSocialLinks(
      siteParsed?.success ? siteParsed.data.socialLinks : undefined,
    );

    const brandingFromDoc: CmsSiteBranding | undefined =
      siteParsed?.success ? siteParsed.data.branding : undefined;
    const branding = resolveSiteBranding(brandingFromDoc);

    const searchQuickKeywords = mergeSearchQuickKeywords(
      siteParsed?.success ? siteParsed.data.searchQuickKeywords : undefined,
      staticBundle.searchQuickKeywords,
    );

    const heroSlides: HomeHeroSlide[] = (() => {
      if (!heroParsed?.success) {
        return fsHero;
      }
      if (heroParsed.data.slides.length > 0) {
        return mapHeroFromCms(heroParsed.data.slides);
      }
      const useFileFallback = heroParsed.data.useFileFallbackWhenEmpty !== false;
      return useFileFallback ? fsHero : [];
    })();

    const sectionBanners =
      sectionParsed?.success && sectionParsed.data.items.length > 0
        ? sectionParsed.data.items
        : fsSectionBanners;

    const branches: PublicBranchesData =
      branchesParsed?.success &&
      (branchesParsed.data.sales.length > 0 ||
        branchesParsed.data.service.length > 0)
        ? {
            sales: branchesParsed.data.sales as SalesBranch[],
            service: branchesParsed.data.service as ServiceBranch[],
          }
        : staticBundle.branches;

    const retailers =
      retailersParsed?.success && retailersParsed.data.retailers.length > 0
        ? {
            list: retailersParsed.data.retailers as AuthorizedRetailer[],
            mapHeroSrc: retailersParsed.data.mapHeroSrc,
          }
        : staticBundle.retailers;

    const usedFirestore =
      (siteParsed?.success ?? false) ||
      (heroParsed?.success ?? false) ||
      (sectionParsed?.success && sectionParsed.data.items.length > 0) ||
      (branchesParsed?.success &&
        (branchesParsed.data.sales.length > 0 ||
          branchesParsed.data.service.length > 0)) ||
      (retailersParsed?.success && retailersParsed.data.retailers.length > 0);

    return {
      source: usedFirestore ? "firestore" : "fallback",
      promoFlash,
      topAnnouncementBar,
      socialLinks,
      branding,
      searchQuickKeywords,
      heroSlides,
      sectionBanners,
      branches,
      retailers,
    };
  } catch (e) {
    console.error("[cms] fetch failed, using static files", e);
    return staticBundle;
  }
}

const getCachedPublicSiteContent = unstable_cache(
  async () => fetchPublicSiteContentUncached(),
  ["storefront-cms-v2"],
  { revalidate: 60, tags: [CMS_CACHE_TAG] },
);

/**
 * Cached CMS bundle — `revalidate: 60`؛ استدعِ `revalidateTag(CMS_CACHE_TAG)` بعد النشر من لوحة التحكم.
 */
export async function getPublicSiteContent(): Promise<PublicSiteContent> {
  return getCachedPublicSiteContent();
}

export async function getSpotlightsFromFirestore(): Promise<
  import("@/schemas/cms").CmsSpotlightsDoc | null
> {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return null;
  }
  try {
    const db = getAdminFirestore();
    const snap = await db
      .collection(STOREFRONT_CMS_COLLECTION)
      .doc(CMS_DOC_IDS.spotlights)
      .get();
    if (!snap.exists) return null;
    const parsed = cmsSpotlightsDocSchema.safeParse(snap.data());
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
