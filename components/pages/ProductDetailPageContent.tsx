"use client";

import { Link } from "next-view-transitions";
import { useTransitionRouter } from "next-view-transitions";
import { useCallback } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { useCart } from "@/hooks/useCart";
import { useProductDetailPage } from "@/hooks/useProductDetailPage";
import { ROUTES } from "@/lib/constants";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";
import type { Product } from "@/features/products/types";
import { ProductDetail } from "@/features/products/components/ProductDetail";
import { ProductCarouselRow } from "@/features/products/components/product-carousel-row";
import { ProductReviewForm } from "@/features/reviews/components/ProductReviewForm";
import { ProductReviewsList } from "@/features/reviews/components/product-reviews-list";
import { useReviewEligibility } from "@/features/reviews/hooks/useReviewEligibility";
import { useAuthSession } from "@/hooks/useAuthSession";

function ProductDetailPageSkeleton() {
  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-10" aria-busy>
      <div className="min-w-0 space-y-3">
        <div className="aspect-square animate-shimmer rounded-2xl border border-border/70 bg-gradient-to-r from-image-well via-background to-image-well bg-[length:200%_100%]" />
        <div className="flex justify-center gap-2 lg:justify-start">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-14 w-14 animate-shimmer rounded-xl bg-surface-muted/80 ring-1 ring-foreground/[0.04] sm:h-16 sm:w-16"
            />
          ))}
        </div>
      </div>
      <div className="min-w-0 rounded-2xl border border-border/70 bg-white p-4 shadow-[0_8px_30px_-18px_rgba(15,23,42,0.18)] sm:p-6">
        <div className="h-5 w-28 animate-shimmer rounded bg-surface-muted/80" />
        <div className="mt-4 h-8 w-4/5 animate-shimmer rounded bg-surface-muted/90" />
        <div className="mt-2 h-8 w-3/5 animate-shimmer rounded bg-surface-muted/80" />
        <div className="mt-5 h-7 w-36 animate-shimmer rounded bg-brand-100" />
        <div className="mt-6 space-y-2">
          <div className="h-4 animate-shimmer rounded bg-surface-muted/80" />
          <div className="h-4 w-11/12 animate-shimmer rounded bg-surface-muted/70" />
          <div className="h-4 w-2/3 animate-shimmer rounded bg-surface-muted/70" />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="h-12 animate-shimmer rounded-xl bg-surface-muted/80" />
          <div className="h-12 animate-shimmer rounded-xl bg-brand-100" />
        </div>
      </div>
    </div>
  );
}

/**
 * عميل صفحة المنتج
 * بالعامية: بيجمع `useProductDetailPage` + أهلية التقييم + السلة؛ «اشتري الآن» يعدّي الكمية ويروح للـ checkout.
 *
 * خريطة الشكل والتقييمات في التعليق اللي تحت.
 */
/*
 * صفحة تفاصيل المنتج (/products/[id]): داخل Container بعرض كامل.
 * الأعلى: مسار تصفح ثم بطاقة كبيرة؛ على lg الجاليري يمين/الشراء يسار حسب RTL، وعلى الموبايل يتكدس الجاليري ثم كارت الشراء.
 * تحت البطاقة: شريط ثقة كامل العرض، ثم كارت تبويبات للوصف/المواصفات/صور إضافية. التقييمات والمنتجات ذات الصلة تأتي في كروت منفصلة بنفس عرض المحتوى.
 * التقييمات: نموذج «أضف تقييماً» يظهر فقط لمسجّل اشترى نفس ‎`id`‎ بطلب ‎`completed`‎ (بدون تكرار)؛ باقي المسجّلين/الزوّار يرون القائمة إن وُجدت.
 */
export type ProductTrustSummary = {
  salesBranchesCount: number;
  serviceBranchesCount: number;
};

export function ProductDetailPageContent({
  id,
  trustSummary,
}: {
  id: number;
  trustSummary?: ProductTrustSummary;
}) {
  const router = useTransitionRouter();
  const {
    productQuery,
    reviewsQuery,
    relatedQuery,
    relatedProducts,
    specs,
    goToProducts,
  } = useProductDetailPage(id);

  const { hasHydrated, getCartLineQuantity, setProductLineQuantity } = useCart();
  const { isAuthenticated } = useAuthSession();
  const reviewElig = useReviewEligibility(
    productQuery.data?.id ?? id,
  );
  const canShowReviewForm =
    productQuery.isSuccess &&
    productQuery.data &&
    reviewElig.isReady &&
    !reviewElig.isError &&
    reviewElig.data?.canReview;

  const addProductToCart = useCallback(
    (product: Product, quantity: number) => {
      const current = getCartLineQuantity(product.id);
      setProductLineQuantity(product, current + Math.max(1, quantity));
    },
    [getCartLineQuantity, setProductLineQuantity],
  );

  const buyNow = useCallback(
    (product: Product, quantity: number) => {
      setProductLineQuantity(product, quantity);
      router.push(ROUTES.CHECKOUT);
    },
    [router, setProductLineQuantity],
  );

  return (
    <Container className="w-full min-w-0 py-4 sm:py-10">
      {/* حالات التحميل/الخطأ/غياب المنتج: محتوى واحد بعرض الحاوية */}
      {productQuery.isPending ? (
        <ProductDetailPageSkeleton />
      ) : productQuery.isError ? (
        <ErrorState
          message={productQuery.error.message}
          onRetry={() => void productQuery.refetch()}
        />
      ) : !productQuery.data ? (
        <EmptyState
          title="المنتج غير موجود"
          description="قد يكون المنتج غير متوفر حالياً."
          action={
            <Button type="button" onClick={goToProducts}>
              العودة للمنتجات
            </Button>
          }
        />
      ) : (
        <>
          {/* كتلة المنتج الرئيسية: PDP كامل العرض داخل الحاوية */}
          <ProductDetail
            key={productQuery.data.id}
            product={productQuery.data}
            onAddToCart={addProductToCart}
            onBuyNow={buyNow}
            specs={specs}
            canInteractCart={hasHydrated}
            trustSummary={trustSummary}
          />

          {/* كارت التقييمات: نفس لغة تبويبات تفاصيل المنتج مع حالة الأهلية */}
          <section id="product-reviews-section" className="mt-10 min-w-0 scroll-mt-28">
            <div
              className={cn(
                surfacePanelClass,
                "mx-auto w-full min-w-0 max-w-7xl overflow-hidden rounded-3xl",
              )}
            >
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-surface-muted/40 px-4 py-3 sm:px-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    آراء العملاء
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold tracking-tight sm:text-xl">
                    التقييمات
                  </h2>
                </div>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                  {reviewsQuery.data?.length ?? 0} تقييم
                </span>
              </div>
              <div className="p-4 sm:p-5">
              {isAuthenticated && !reviewElig.isReady && !reviewElig.isError && (
                <p className="mt-3 text-sm text-zinc-600" aria-live="polite">
                  جاري التحقق من إمكانية إضافة تقييم…
                </p>
              )}
              {isAuthenticated && reviewElig.isError && (
                <p className="mt-3 text-sm text-red-800" role="alert">
                  تعذر التحقق من صلاحية التقييم. حدّث الصفحة لاحقاً.
                </p>
              )}
              {isAuthenticated && reviewElig.isReady && reviewElig.data?.alreadyReviewed && (
                <p className="mt-3 text-sm text-zinc-700" role="status">
                  لقد سجّلت تقييماً مسبقاً لهذا المنتج. شكراً لمشاركتك.
                </p>
              )}
              {isAuthenticated && reviewElig.isReady && reviewElig.data && !reviewElig.data.alreadyReviewed && !reviewElig.data.canReview && (
                <p className="mt-3 rounded-xl border border-amber-100/80 bg-amber-50/50 px-3 py-2 text-sm text-amber-950" role="status">
                  تظهر لك أداة إضافة التقييم عند اكتمال طلب يتضمّن هذا المنتج. تستطيع متابعة المنتجات المؤهّلة من
                  {" "}
                  <Link
                    className="font-semibold text-brand-800 underline-offset-2 hover:underline"
                    href={ROUTES.MY_REVIEWS}
                  >
                    تقييماتي
                  </Link>
                  .
                </p>
              )}
              {!isAuthenticated && (
                <p className="mt-3 text-sm text-muted-foreground" role="status">
                  سجّل الدخول من صفحة حسابك إذا أردت إضافة تقييم بعد شراء المنتج.
                </p>
              )}
              {canShowReviewForm && (
                <ProductReviewForm productId={productQuery.data.id} />
              )}
              <div className="mt-4">
                {reviewsQuery.isPending ? (
                  <div className="space-y-0" aria-label="جاري تحميل التقييمات" aria-busy>
                    <ul className="mx-auto w-full max-w-md list-none p-0 md:hidden">
                      <li className="rounded-xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)]">
                        <div className="flex items-center justify-between gap-2">
                          <div className="h-4 w-28 animate-shimmer rounded bg-border/70" />
                          <div className="h-3 w-20 animate-shimmer rounded bg-border/70" />
                        </div>
                        <div className="mt-2 h-2 w-32 animate-shimmer rounded bg-border/50" />
                        <div className="mt-3 space-y-2">
                          <div className="h-3 animate-shimmer rounded bg-surface-muted" />
                          <div className="h-3 w-11/12 animate-shimmer rounded bg-surface-muted" />
                        </div>
                      </li>
                    </ul>
                    <ul className="hidden list-none space-y-4 p-0 md:block">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <li
                          key={index}
                          className="rounded-xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="h-4 w-28 animate-shimmer rounded bg-border/70" />
                            <div className="h-3 w-20 animate-shimmer rounded bg-border/70" />
                          </div>
                          <div className="mt-2 h-2 w-32 animate-shimmer rounded bg-border/50" />
                          <div className="mt-3 space-y-2">
                            <div className="h-3 animate-shimmer rounded bg-surface-muted" />
                            <div className="h-3 w-11/12 animate-shimmer rounded bg-surface-muted" />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : reviewsQuery.isError ? (
                  <ErrorState
                    message={reviewsQuery.error.message}
                    onRetry={() => void reviewsQuery.refetch()}
                  />
                ) : !reviewsQuery.data || reviewsQuery.data.length === 0 ? (
                  <EmptyState
                    title="لا توجد تقييمات من العملاء بعد"
                    description={
                      canShowReviewForm
                        ? "بعد إرسالك، سيظهر تقييمك في هذه القائمة."
                        : "يُعرض هنا رأي العملاء الذين أتموا شراءً لهذا المنتج."
                    }
                  />
                ) : (
                  <ProductReviewsList
                    key={productQuery.data.id}
                    reviews={reviewsQuery.data}
                  />
                )}
              </div>
              </div>
            </div>
          </section>

          {/* منتجات مشابهة: كارت مستقل بأسفل صفحة المنتج مثل مرجع التصميم */}
          <section className="mt-10 min-w-0">
            <div
              className={cn(
                surfacePanelClass,
                "mx-auto w-full min-w-0 max-w-7xl rounded-3xl p-4 sm:p-5",
              )}
            >
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    قد يعجبك أيضًا
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold tracking-tight sm:text-xl">
                    منتجات مشابهة
                  </h2>
                </div>
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                  href={ROUTES.PRODUCTS}
                >
                  عرض الكل
                </Link>
              </div>
              <div className="mt-6">
                {relatedQuery.isError ? (
                  <ErrorState
                    message={relatedQuery.error.message}
                    onRetry={() => void relatedQuery.refetch()}
                  />
                ) : (
                  <ProductCarouselRow
                    status={
                      relatedQuery.isPending
                        ? "loading"
                        : relatedProducts.length === 0
                          ? "empty"
                          : "ready"
                    }
                    empty={
                      <EmptyState
                        title="لا توجد منتجات ذات صلة"
                        description="تصفح الكتالوج لمزيد من الأفكار."
                      />
                    }
                    products={relatedProducts}
                    getCartLineQuantity={getCartLineQuantity}
                    onCartLineQuantityChange={setProductLineQuantity}
                  />
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </Container>
  );
}
