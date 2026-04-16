import { Container } from "@/components/Container";
import { ProductGrid } from "@/features/products/components/ProductGrid";

/*
 * هيكل تحميل لصفحة المنتجات: يحاكي رأس الكتالوج (عنوان + سطر فرعي) ثم صف حبيبات تصفية شكلية ثم شبكة تحميل.
 * يُعرض أثناء Suspense/التوجيه؛ يبقى عموداً واحداً داخل Container مثل جزء الرأس في ProductsPageContent.
 */
export function ProductsCatalogSkeleton() {
  return (
    <Container className="py-10" aria-busy="true" aria-label="جاري تحميل المنتجات">
      {/* يطابق ترتيب رأس ProductsPageContent (عنوان + وصف) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-9 min-w-0 max-w-none rounded-lg bg-muted/80 animate-pulse sm:h-10 sm:w-56" />
          <div className="h-4 min-w-0 max-w-none rounded bg-muted/60 animate-pulse" />
        </div>
      </div>

      {/* شريط حبيبات placeholder بعرض المحتوى */}
      <div className="mt-6 flex min-h-[2.25rem] flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-9 min-w-[3.25rem] shrink-0 rounded-full bg-muted/70 animate-pulse sm:min-w-[4rem]"
          />
        ))}
      </div>

      {/* منطقة الشبكة: حالة تحميل من ProductGrid */}
      <div className="mt-8 min-h-[12rem]">
        <ProductGrid status="loading" />
      </div>
    </Container>
  );
}
