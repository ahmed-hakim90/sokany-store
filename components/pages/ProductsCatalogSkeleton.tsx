import { Container } from "@/components/Container";
import { ProductGrid } from "@/features/products/components/ProductGrid";

/*
 * هيكل تحميل لصفحة المنتجات: يحاكي شريط التصنيفات ثم الشبكة — نفس الحشو الأفقي/السفلي مثل ‎`ProductsPageContent`‎.
 */
export function ProductsCatalogSkeleton() {
  return (
    <Container
      className="pt-2 pb-10 sm:px-2 lg:px-8"
      aria-busy="true"
      aria-label="جاري تحميل المنتجات"
    >
      <div className="h-16 min-w-0 animate-pulse rounded-xl bg-muted/50 sm:h-[4.5rem]" />

      <div className="mt-4 min-h-[12rem] sm:mt-5">
        <ProductGrid status="loading" />
      </div>
    </Container>
  );
}
