import { Container } from "@/components/Container";
import {
  CatalogBannerSkeleton,
  CatalogDiscoverySkeleton,
  CatalogPageHeaderSkeleton,
  CatalogProductGridSkeleton,
  CatalogSidebarSkeleton,
} from "@/features/catalog/components/catalog-page-skeletons";

/*
 * هيكل تحميل Suspense لصفحة /products:
 * — يحاكي الرأس، السكة، البانر، الشريط الجانبي (lg)، والشبكة.
 */
export function ProductsCatalogSkeleton() {
  return (
    <Container
      className="flex flex-col gap-4 pt-2 pb-10 sm:px-2 lg:px-8"
      aria-busy="true"
      aria-label="جاري تحميل المنتجات"
    >
      <CatalogPageHeaderSkeleton />
      <div className="h-4 w-48 animate-shimmer rounded bg-border/40" aria-hidden />
      <div className="lg:hidden">
        <CatalogDiscoverySkeleton />
      </div>
      <CatalogBannerSkeleton />
      <div className="grid gap-4 lg:grid-cols-[minmax(200px,240px)_minmax(0,1fr)] lg:gap-8">
        <CatalogSidebarSkeleton />
        <div className="flex min-w-0 flex-col gap-4">
          <CatalogProductGridSkeleton />
        </div>
      </div>
    </Container>
  );
}
