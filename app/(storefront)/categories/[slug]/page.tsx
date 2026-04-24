import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  CategorySlugPageContent,
  CategorySlugPageLoadingFallback,
} from "@/components/pages/CategorySlugPageContent";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { mockCategories } from "@/features/categories/mock";
import { getSnapshotCategories } from "@/features/data-snapshot/server";
import { getCategoryBySlugMeta } from "@/features/categories/services/getCategoryBySlugMeta";
import { trimMetaDescription } from "@/lib/html";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const fallbackCategories = getSnapshotCategories() ?? mockCategories;
  const uniqueSlugs = Array.from(
    new Set(fallbackCategories.map((category) => category.slug)),
  );
  return uniqueSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlugMeta(slug);
  if (!category) return { title: "تصنيف غير موجود" };

  const site = getSiteUrl();
  const title = `${category.name} | ${SITE_BRAND_TITLE_AR}`;
  const rawDescription = `تصفح كل منتجات ${category.name} من سوكانى. ${category.count} منتج بأفضل الأسعار وضمان أصلي.`;
  const description = trimMetaDescription(rawDescription);

  return {
    title,
    description,
    keywords: [category.name, "سوكانى", "أجهزة كهربائية", category.slug],
    openGraph: {
      title,
      description,
      type: "website",
      url: `${site}/categories/${slug}`,
      siteName: SITE_BRAND_TITLE_AR,
      locale: "ar_EG",
    },
    alternates: { canonical: `${site}/categories/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlugMeta(slug);
  if (!category) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", href: "/" },
          { name: "التصنيفات", href: "/categories" },
          { name: category.name },
        ]}
      />
      <Suspense fallback={<CategorySlugPageLoadingFallback />}>
        <CategorySlugPageContent slug={slug} />
      </Suspense>
    </>
  );
}
