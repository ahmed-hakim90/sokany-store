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
import type { Product } from "@/features/products/types";
import { ProductDetail } from "@/features/products/components/ProductDetail";
import { ProductCarouselRow } from "@/features/products/components/product-carousel-row";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";
import { ProductReviewForm } from "@/features/reviews/components/ProductReviewForm";
import { ProductReviewsList } from "@/features/reviews/components/product-reviews-list";
import { useReviewEligibility } from "@/features/reviews/hooks/useReviewEligibility";
import { useAuthSession } from "@/hooks/useAuthSession";

/*
 * صفحة تفاصيل المنتج (/products/[id]): عمود واحد داخل Container (حواف أفقية فقط).
 * كتلة المنتج (معرض + معلومات/شراء) بعرض كامل داخل الحاوية؛ شريط «أضف للسلة» ثابت عند التمرير بعد كتلة الشراء.
 * التقييمات: نموذج «أضف تقييماً» يظهر فقط لمسجّل اشترى نفس ‎`id`‎ بطلب ‎`completed`‎ (بدون تكرار)؛ باقي المسجّلين/الزوّار يرون القائمة إن وُجدت. على الشاشة الضيقة (أقل من md) سلايد؛ من ‎`md`‎ فما فوق قائمة. «ذات صلة» داخل ‎`max-w-7xl`‎.
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
        <ProductSkeleton />
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

          {/* أسفل المنتج: التقييمات داخل عمود max-w-7xl متمركز */}
          <section className="mt-16 min-w-0 border-t border-border pt-12">
            <div className="mx-auto w-full min-w-0 max-w-7xl">
              <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                التقييمات
              </h2>
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
                <p className="mt-3 text-sm text-zinc-700" role="status">
                
                  {" "}
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
          </section>

          {/* منتجات ذات صلة: نفس عمود max-w-7xl؛ كاروسيل كروت أوسع (عدد أقل مرئيًا) */}
          <section className="mt-16 min-w-0 border-t border-border pt-12">
            <div className="mx-auto w-full min-w-0 max-w-7xl">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-4">
                <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                  منتجات ذات صلة
                </h2>
                <Link
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
