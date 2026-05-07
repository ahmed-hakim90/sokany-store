import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppImage } from "@/components/AppImage";
import { LegalPageShell } from "@/components/layout/legal-page-shell";
import { WarrantyPostProductGrid } from "@/components/pages/WarrantyPostProductGrid";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { getProductByIdMeta } from "@/features/products/services/getProductByIdMeta";
import { getProductsBySlugsServer } from "@/features/products/services/getProductsBySlugsServer";
import type { Product } from "@/features/products/types";
import { fetchSokanyWpPost } from "@/lib/sokany-official-wp";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

function formatPostDate(date: string | null): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function readingMinutes(wordCount: number): number {
  if (wordCount <= 0) return 1;
  return Math.max(1, Math.ceil(wordCount / 180));
}

async function getPostProducts(productIds: number[], productSlugs: string[]): Promise<Product[]> {
  const [productsById, productsBySlug] = await Promise.all([
    Promise.all(productIds.map((id) => getProductByIdMeta(id).catch(() => null))),
    getProductsBySlugsServer(productSlugs),
  ]);

  const byId = new Map<number, Product>();
  for (const product of [...productsById, ...productsBySlug]) {
    if (product) byId.set(product.id, product);
  }
  return [...byId.values()];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchSokanyWpPost(slug);
  if (!post) return { title: "موضوع غير موجود" };

  const site = getSiteUrl();
  const title = `${post.title} | ${SITE_BRAND_TITLE_AR}`;

  return {
    title,
    description: post.description,
    openGraph: {
      title,
      description: post.description,
      url: `${site}/warranty/${slug}`,
      siteName: SITE_BRAND_TITLE_AR,
      locale: "ar_EG",
      type: "article",
    },
    alternates: { canonical: `${site}/warranty/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function WarrantyPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchSokanyWpPost(slug);
  if (!post) notFound();

  const formattedDate = formatPostDate(post.date);
  const products = await getPostProducts(post.productIds, post.productSlugs);
  const minutes = readingMinutes(post.wordCount);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", href: "/" },
          { name: "طرق الاستخدام", href: "/warranty" },
          { name: post.title },
        ]}
      />
      <LegalPageShell dir="rtl" lang="ar" containerClassName="max-w-5xl">
        <header className="mb-6 border-b border-border/80 pb-6 sm:mb-8">
          <Link
            href="/warranty"
            className="mb-4 inline-flex text-sm font-medium text-brand-800 underline-offset-2 hover:underline"
          >
            طرق الاستخدام
          </Link>
          <h1 className="text-right font-display text-2xl font-bold text-brand-950 md:text-3xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
            {formattedDate ? (
              <span className="rounded-full border border-border/80 bg-surface-muted/40 px-3 py-1">
                {formattedDate}
              </span>
            ) : null}
            <span className="rounded-full border border-border/80 bg-surface-muted/40 px-3 py-1">
              قراءة {minutes} د
            </span>
            {products.length > 0 ? (
              <span className="rounded-full border border-border/80 bg-surface-muted/40 px-3 py-1">
                {products.length} منتج في المقال
              </span>
            ) : null}
          </div>
          {post.description ? (
            <p className="mt-5 max-w-3xl text-[15px] leading-8 text-brand-950/80 sm:text-base">
              {post.description}
            </p>
          ) : null}
        </header>

        {post.heroImage ? (
          <div className="mb-8 overflow-hidden rounded-2xl border border-border/70 bg-surface-muted/30">
            <div className="relative aspect-[16/9] w-full">
              <AppImage
                src={post.heroImage}
                alt={post.title}
                fill
                priority
                sizes="(min-width: 1024px) 896px, 100vw"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        {products.length > 0 ? (
          <section className="mb-8 rounded-2xl border border-brand-100 bg-brand-50/45 p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-brand-950">
                  المنتجات المذكورة في المقال
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  المنتجات المرتبطة بالمحتوى، مع السعر والتوفر من المتجر مباشرة.
                </p>
              </div>
              <Link
                href="/products"
                className="text-sm font-semibold text-brand-800 underline-offset-2 hover:underline"
              >
                تصفح كل المنتجات
              </Link>
            </div>
            <WarrantyPostProductGrid products={products} />
          </section>
        ) : null}

        <div className="min-w-0 overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <article
            dir="rtl"
            lang="ar"
            className={cn(
              "legal-wp-prose official-wp-content",
              "prose prose-sm sm:prose-base prose-neutral max-w-none text-pretty",
              "prose-headings:font-display prose-headings:text-brand-950",
              "prose-p:text-brand-950 prose-li:marker:text-brand-700",
              "prose-a:text-brand-800 prose-a:font-medium prose-a:no-underline hover:prose-a:underline",
              "prose-strong:text-brand-950",
              "prose-img:mx-auto prose-img:max-w-full prose-img:rounded-xl prose-img:shadow-sm",
            )}
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </div>

        <footer className="mt-8 flex flex-col gap-3 border-t border-border/80 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>المحتوى معاد عرضه من مدونة سوكاني الرسمية بتنسيق مناسب للمتجر.</span>
          <Link
            href="/warranty"
            className="font-semibold text-brand-800 underline-offset-2 hover:underline"
          >
            المزيد من طرق الاستخدام
          </Link>
        </footer>
      </LegalPageShell>
    </>
  );
}
