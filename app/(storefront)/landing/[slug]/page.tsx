import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductLandingPageContent } from "@/components/pages/landing/ProductLandingPageContent";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { getPublicSiteContent } from "@/features/cms/services/getPublicSiteContent";
import { getProductMetaBySlugOrId } from "@/features/products/services/getProductByIdMeta";
import { toProductViewFromProduct } from "@/features/products/product-view";
import { formatPriceEgp } from "@/lib/format";
import { trimMetaDescription } from "@/lib/html";
import { getSiteUrl, toAbsoluteSiteUrl } from "@/lib/site";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";

type PageProps = { params: Promise<{ slug: string }> };

function configuredProductSegment(
  landing: Awaited<ReturnType<typeof getPublicSiteContent>>["productLandingPage"],
): string | null {
  const slug = landing.productSlug?.trim();
  if (slug) return slug;
  if (landing.productId) return String(landing.productId);
  return null;
}

/*
 * صفحة هبوط منتج واحد: السيرفر يقرأ إعدادات CMS أولاً ثم يجيب المنتج المختار من Woo.
 * إن كان الرابط لا يطابق slug المنتج المختار أو الصفحة غير مفعّلة، يرجع 404 حتى لا تظهر صفحة قديمة أو منتج غير مقصود.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getPublicSiteContent();
  const landing = content.productLandingPage;
  const segment = landing.enabled ? configuredProductSegment(landing) : null;
  if (!segment) return { title: "صفحة عرض غير متاحة" };

  const product = await getProductMetaBySlugOrId(segment);
  if (!product || product.slug !== slug.trim()) {
    return { title: "صفحة عرض غير متاحة" };
  }

  const site = getSiteUrl();
  const title = `${landing.customTitle?.trim() || product.name} | عرض فلاش | ${SITE_BRAND_TITLE_AR}`;
  const fallback = `عرض لفترة محدودة على ${product.name} بسعر ${formatPriceEgp(product.price)} من ${SITE_BRAND_TITLE_AR}.`;
  const description = trimMetaDescription(
    landing.customDescription?.trim() || product.shortDescription || fallback,
  );
  const thumb = product.images[0];
  const ogThumbUrl = thumb ? toAbsoluteSiteUrl(thumb.src) : undefined;
  const url = `${site}/landing/${product.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: SITE_BRAND_TITLE_AR,
      locale: "ar_EG",
      images: ogThumbUrl
        ? [{ url: ogThumbUrl, width: 800, height: 800, alt: product.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogThumbUrl ? { images: [ogThumbUrl] } : {}),
    },
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  };
}

export default async function ProductLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getPublicSiteContent();
  const landing = content.productLandingPage;
  const segment = landing.enabled ? configuredProductSegment(landing) : null;
  if (!segment) notFound();

  const product = await getProductMetaBySlugOrId(segment);
  if (!product || product.slug !== slug.trim()) notFound();

  return (
    <>
      <ProductJsonLd
        product={toProductViewFromProduct(product)}
        brandName={content.branding.siteWordmark}
        sellerName={content.branding.organizationName}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", href: "/" },
          { name: "عرض فلاش", href: `/landing/${product.slug}` },
          { name: product.name },
        ]}
      />
      <ProductLandingPageContent product={product} landingConfig={landing} />
    </>
  );
}
