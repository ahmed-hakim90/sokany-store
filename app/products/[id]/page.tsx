import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPageContent } from "@/components/pages/ProductDetailPageContent";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ProductJsonLd } from "@/components/seo/ProductJsonLd";
import { mockProducts } from "@/features/products/mock";
import { getProductByIdMeta } from "@/features/products/services/getProductByIdMeta";
import { toProductViewFromProduct } from "@/features/products/product-view";
import { formatPriceEgp } from "@/lib/format";
import { trimMetaDescription } from "@/lib/html";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

type PageProps = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return mockProducts.slice(0, 50).map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductByIdMeta(Number(id));
  if (!product) return { title: "منتج غير موجود" };

  const site = getSiteUrl();
  const title = `${product.name} | ${SITE_BRAND_TITLE_AR}`;
  const fallback = `اشتري ${product.name} بسعر ${formatPriceEgp(product.price)} من ${SITE_BRAND_TITLE_AR}. ضمان أصلي وشحن سريع.`;
  const description = trimMetaDescription(
    product.shortDescription || fallback,
  );
  const thumb = product.images[0];

  return {
    title,
    description,
    keywords: [
      product.sku,
      product.name,
      ...product.categories.map((c) => c.name),
      "سوكانى",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `${site}/products/${product.id}`,
      siteName: SITE_BRAND_TITLE_AR,
      locale: "ar_EG",
      images: thumb
        ? [{ url: thumb.src, width: 800, height: 800, alt: product.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: { canonical: `${site}/products/${product.id}` },
    robots: { index: true, follow: true },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const product = await getProductByIdMeta(numericId);
  if (!product) notFound();

  const view = toProductViewFromProduct(product);
  const primaryCategory = product.categories[0];

  return (
    <>
      <ProductJsonLd product={view} />
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", href: "/" },
          ...(primaryCategory
            ? [
                {
                  name: primaryCategory.name,
                  href: `/categories/${primaryCategory.slug}`,
                },
              ]
            : []),
          { name: product.name },
        ]}
      />
      <ProductDetailPageContent id={numericId} />
    </>
  );
}
