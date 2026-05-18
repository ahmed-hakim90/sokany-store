"use client";

import { Link } from "next-view-transitions";
import { Headphones } from "lucide-react";
import { Button } from "@/components/Button";
import { ProductCarouselRow } from "@/features/products/components/product-carousel-row";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import {
  CONTACT_EMAIL,
  ROUTES,
  WHATSAPP_SUPPORT_URL,
} from "@/lib/constants";
import { surfaceEmptyStateClass } from "@/lib/storefront-surfaces";

const SUGGESTED_CATEGORIES = [
  { slug: "kitchen-supplies", label: "المطبخ" },
  { slug: "home-appliances", label: "الأجهزة المنزلية" },
  { slug: "personal-care", label: "العناية الشخصية" },
] as const;

export function SearchNoResultsPanel({ query }: { query: string }) {
  const { getCartLineQuantity, setProductLineQuantity } = useCart();
  const bestSellersQuery = useProducts({ orderby: "popularity", per_page: 8 });
  const carouselStatus = bestSellersQuery.isLoading
    ? "loading"
    : (bestSellersQuery.data?.items.length ?? 0) > 0
      ? "ready"
      : "empty";

  return (
    <div className="space-y-8">
      <div className={surfaceEmptyStateClass}>
        <p className="font-display text-lg font-semibold text-brand-950">لا توجد نتائج</p>
        <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground">
          {query
            ? `لم نعثر على منتجات تطابق «${query}». جرّب كلمات أقصر أو تصفح الأقسام.`
            : "لم نعثر على منتجات لهذا البحث."}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {SUGGESTED_CATEGORIES.map((c) => (
            <Link key={c.slug} href={ROUTES.CATEGORY(c.slug)}>
              <Button type="button" variant="secondary" size="md">
                {c.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <section
        className="rounded-2xl border border-border/70 bg-white/90 p-4 sm:p-5"
        aria-labelledby="search-support-heading"
      >
        <div className="flex items-start gap-3">
          <Headphones className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden />
          <div className="min-w-0 text-start">
            <h2
              id="search-support-heading"
              className="font-display text-base font-semibold text-brand-950"
            >
              تحتاج مساعدة في الاختيار؟
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              فريق الدعم يساعدك في العثور على المنتج المناسب.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {WHATSAPP_SUPPORT_URL ? (
                <a href={WHATSAPP_SUPPORT_URL} target="_blank" rel="noopener noreferrer">
                  <Button type="button" variant="primary" size="md">
                    واتساب الدعم
                  </Button>
                </a>
              ) : null}
              <Link href={ROUTES.CONTACT}>
                <Button type="button" variant="secondary" size="md">
                  تواصل معنا
                </Button>
              </Link>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <Button type="button" variant="ghost" size="md">
                  {CONTACT_EMAIL}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="search-bestsellers-heading">
        <h2
          id="search-bestsellers-heading"
          className="font-display text-base font-semibold text-brand-950 sm:text-lg"
        >
          الأكثر مبيعاً
        </h2>
        <ProductCarouselRow
          className="mt-4"
          status={carouselStatus}
          products={bestSellersQuery.data?.items ?? []}
          getCartLineQuantity={getCartLineQuantity}
          onCartLineQuantityChange={setProductLineQuantity}
        />
      </section>
    </div>
  );
}
