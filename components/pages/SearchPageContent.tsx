"use client";

import { Link } from "next-view-transitions";
import { EmptyState } from "@/components/EmptyState";
import { CatalogFilterDrawerTrigger } from "@/features/catalog/components/CatalogFilterDrawerTrigger";
import { NavbarSearch } from "@/components/layout/navbar-search";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import type { Product } from "@/features/products/types";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { DEFAULT_SEARCH_QUICK_KEYWORDS } from "@/lib/search-quick-keywords";
import { cn } from "@/lib/utils";

function ReturnToShopLink({ className }: { className?: string }) {
  return (
    <Link
      href={ROUTES.PRODUCTS}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-brand-500 px-5 text-sm font-semibold text-black transition-colors hover:bg-brand-400",
        className,
      )}
    >
      العودة للتسوق
    </Link>
  );
}

export type SearchPageContentProps = {
  /** Normalized search string (may be short; parent decides fetch). */
  query: string;
  /** When false, parent skipped Woo because query was too short. */
  searched: boolean;
  products: Product[];
  /** من CMS — نفس شريط البحث في النافبار. */
  quickKeywords?: readonly string[];
};

/*
 * صفحة `/search` (موبايل + ديسكتوب):
 * - صف بحث + زر فلتر (درج الكتالوج) يعيد بناء الرابط مع `q` والمعاملات.
 * - أسفله: حالة فارغة أو شبكة نتائج.
 */
export function SearchPageContent({
  query,
  searched,
  products,
  quickKeywords = DEFAULT_SEARCH_QUICK_KEYWORDS,
}: SearchPageContentProps) {
  const { getCartLineQuantity, setProductLineQuantity } = useCart();

  return (
    <div className="min-w-0 space-y-8">
      {/*
        موبايل: البحث والفلتر هنا فقط (أُزيلا من الهيدر العلوي).
        ديسكتوب: نفس الأدوات في `Navbar` — نخفي هذا الصف لتفادي التكرار.
      */}
      <div className="flex min-w-0 w-full items-center gap-2 lg:hidden">
        <div className="min-w-0 flex-1">
          <NavbarSearch quickKeywords={quickKeywords} />
        </div>
        <CatalogFilterDrawerTrigger />
      </div>

      {!searched ? (
        <EmptyState
          title="أدخل 3 أحرف على الأقل"
          description="اكتب في شريط البحث (أعلى الصفحة على الديسكتوب، أو أدناه على الموبايل) ثم اضغط Enter، أو اختر اقتراحاً سريعاً."
          action={<ReturnToShopLink />}
        />
      ) : null}

      {searched && !products.length ? (
        <EmptyState
          title="لا توجد نتائج"
          description={
            query
              ? `لم نعثر على منتجات تطابق «${query}». جرّب كلمات مختلفة أو عدّل التصفية.`
              : "لم نعثر على منتجات لهذا البحث."
          }
          action={<ReturnToShopLink />}
        />
      ) : null}

      {searched && products.length > 0 ? (
        <div className="min-w-0">
          <ProductGrid
            products={products}
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={setProductLineQuantity}
            cardVariant="desktopCatalog"
            cardVariantMd="desktopCatalog"
          />
        </div>
      ) : null}
    </div>
  );
}
