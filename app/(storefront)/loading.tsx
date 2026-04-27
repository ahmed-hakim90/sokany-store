import { Container } from "@/components/Container";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";

/**
 * يظهر أثناء انتقال App Router لأي صفحة تحت ‎(storefront)‎ حتى يُجلب الـ RSC/الحِزم.
 * التأخير يحدث لأن: جلب مكوّنات الخادم، طابور React، و(عند التوفّر) ‎`startViewTransition`‎
 * ينتظر لقطة شاشة قبل عرض المسار الجديد — التحميل هنا يعطي رد فعل فوري بعد النقر.
 */
export default function StorefrontRouteLoading() {
  return (
    <Container
      className="py-8 sm:py-10"
      aria-busy="true"
      aria-live="polite"
      aria-label="جاري تحميل الصفحة"
    >
      <div className="mb-6 min-w-0 space-y-3">
        <Skeleton className="h-8 w-48 max-w-[70%] sm:h-9" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-2/3 max-w-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}
