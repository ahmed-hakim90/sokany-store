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

/*
 * صفحة تفاصيل المنتج (/products/[id]): عمود واحد داخل Container (حواف أفقية فقط).
 * كتلة المنتج (معرض + معلومات/شراء) بعرض كامل داخل الحاوية؛ شريط «أضف للسلة» ثابت عند التمرير بعد كتلة الشراء.
 * من sm فما فوق: التقييمات و«منتجات ذات صلة» (كاروسيل أفقي) داخل عمود max-w-7xl؛ lg يبقى نفس الحدود الأفقية من Container.
 */
export function ProductDetailPageContent({ id }: { id: number }) {
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
          />

          {/* أسفل المنتج: التقييمات داخل عمود max-w-7xl متمركز */}
          <section className="mt-16 min-w-0 border-t border-border pt-12">
            <div className="mx-auto w-full min-w-0 max-w-7xl">
              <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                التقييمات
              </h2>
              <ProductReviewForm productId={productQuery.data.id} />
              <div className="mt-4">
                {reviewsQuery.isPending ? (
                  <ul className="space-y-4" aria-label="جاري تحميل التقييمات">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <li
                        key={index}
                        className="rounded-xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="h-4 w-28 animate-shimmer rounded bg-border/70" />
                          <div className="h-3 w-14 animate-shimmer rounded bg-border/70" />
                        </div>
                        <div className="mt-3 space-y-2">
                          <div className="h-3 animate-shimmer rounded bg-surface-muted" />
                          <div className="h-3 w-11/12 animate-shimmer rounded bg-surface-muted" />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : reviewsQuery.isError ? (
                  <ErrorState
                    message={reviewsQuery.error.message}
                    onRetry={() => void reviewsQuery.refetch()}
                  />
                ) : !reviewsQuery.data || reviewsQuery.data.length === 0 ? (
                  <EmptyState
                    title="لا توجد تقييمات بعد"
                    description="كن أول من يشارك تجربته."
                  />
                ) : (
                  <ul className="space-y-4">
                    {reviewsQuery.data.map((review) => (
                      <li
                        key={review.id}
                        className="rounded-xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{review.reviewer}</p>
                          <span className="text-xs text-zinc-500">
                            {review.rating.toFixed(1)} / 5
                          </span>
                        </div>
                        <p className="mt-2 break-words text-sm text-zinc-700">{review.review}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* منتجات ذات صلة: نفس عمود max-w-7xl؛ الشبكة داخل العرض المحدود */}
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
