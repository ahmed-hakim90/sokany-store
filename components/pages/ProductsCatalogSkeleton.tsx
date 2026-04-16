import { Container } from "@/components/Container";
import { ProductGrid } from "@/features/products/components/ProductGrid";

export function ProductsCatalogSkeleton() {
  return (
    <Container className="py-10" aria-busy="true" aria-label="جاري تحميل المنتجات">
      {/* Match ProductsPageContent heading stack (text-3xl title + subtitle line) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-9 w-48 max-w-full rounded-lg bg-muted/80 animate-pulse sm:h-10 sm:w-56" />
          <div className="h-4 w-full max-w-md rounded bg-muted/60 animate-pulse" />
        </div>
      </div>

      <div className="mt-6 flex min-h-[2.25rem] flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-9 min-w-[3.25rem] shrink-0 rounded-full bg-muted/70 animate-pulse sm:min-w-[4rem]"
          />
        ))}
      </div>

      <div className="mt-8 min-h-[12rem]">
        <ProductGrid status="loading" />
      </div>
    </Container>
  );
}
