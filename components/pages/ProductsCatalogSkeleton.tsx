import { Container } from "@/components/Container";
import { ProductGrid } from "@/features/products/components/ProductGrid";

/*
 * هيكل تحميل لصفحة المنتجات: يحاكي رأس الكتالوج (عنوان + وصف) ثم شبكة تحميل.
 * يُعرض أثناء Suspense/التوجيه؛ يطابق ترتيب ProductsPageContent الحالي.
 */
export function ProductsCatalogSkeleton() {
  return (
    <Container className="py-10" aria-busy="true" aria-label="جاري تحميل المنتجات">
      <div className="space-y-2">
        <div className="h-9 min-w-0 max-w-none rounded-lg bg-muted/80 animate-pulse sm:h-10 sm:w-56" />
        <div className="h-4 min-w-0 max-w-none rounded bg-muted/60 animate-pulse sm:max-w-md" />
      </div>

      <div className="mt-6 min-h-[12rem]">
        <ProductGrid status="loading" />
      </div>
    </Container>
  );
}
