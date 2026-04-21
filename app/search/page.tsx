import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SearchPageContent } from "@/components/pages/SearchPageContent";
import { getProductsServer } from "@/features/products/services/getProductsServer";
import { DEFAULT_PER_PAGE } from "@/lib/constants";
import { SITE_BRAND_TITLE_AR } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site";
import {
  normalizeSearchParamQ,
  resolveSearchPageQuery,
} from "@/schemas/search";

const titleBase = `بحث المنتجات | ${SITE_BRAND_TITLE_AR}`;
const description =
  "ابحث في كتالوج سوكانى: أجهزة مطبخ، عناية شخصية، والمزيد — أسعار بالجنيه وضمان أصلي.";

type PageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const rawQ = normalizeSearchParamQ(sp.q);
  const q = resolveSearchPageQuery(rawQ);
  const site = getSiteUrl();
  const title =
    q.length >= 3 ? `«${q}» — نتائج البحث | ${SITE_BRAND_TITLE_AR}` : titleBase;
  const ogUrl =
    q.length > 0
      ? `${site}/search?q=${encodeURIComponent(q)}`
      : `${site}/search`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: ogUrl,
      siteName: SITE_BRAND_TITLE_AR,
      locale: "ar_EG",
      type: "website",
    },
    alternates: { canonical: ogUrl },
    /** صفحات نتائج البحث الداخلية رقيقة ومتكررة — لا تُفهرَس لتفادي الازدواجية. */
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const rawQ = normalizeSearchParamQ(sp.q);
  const q = resolveSearchPageQuery(rawQ);

  const searched = q.length >= 3;
  const products = searched
    ? await getProductsServer({
        search: q,
        per_page: DEFAULT_PER_PAGE,
        page: 1,
      })
    : [];

  return (
    <Container className="py-10">
      <div className="mb-8 min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
          نتائج البحث
        </h1>
        {searched ? (
          <p className="mt-2 break-words text-sm text-muted-foreground">
            {products.length
              ? `عرض ${products.length} نتيجة لـ «${q}»`
              : `لا نتائج لـ «${q}»`}
          </p>
        ) : null}
      </div>

      <SearchPageContent query={q} searched={searched} products={products} />
    </Container>
  );
}
