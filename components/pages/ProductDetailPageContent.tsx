"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";
import { ProductReviewForm } from "@/features/reviews/components/ProductReviewForm";

export function ProductDetailPageContent({ id }: { id: number }) {
  const router = useRouter();
  const {
    productQuery,
    reviewsQuery,
    relatedQuery,
    relatedProducts,
    specs,
    addProductToCart,
    goToProducts,
  } = useProductDetailPage(id);

  const { items, setProductLineQuantity } = useCart();
  const getCartLineQuantity = useCallback(
    (productId: number) => items.find((i) => i.productId === productId)?.quantity ?? 0,
    [items],
  );

  const buyNow = useCallback(
    (product: Product, quantity: number) => {
      setProductLineQuantity(product, quantity);
      router.push(ROUTES.CHECKOUT);
    },
    [router, setProductLineQuantity],
  );

  return (
    <Container className="py-4 sm:py-10">
      {productQuery.isLoading ? (
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
          <ProductDetail
            product={productQuery.data}
            onAddToCart={addProductToCart}
            onBuyNow={buyNow}
            specs={specs}
          />

          <section className="mt-16 min-w-0 border-t border-border pt-12">
            <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
              التقييمات
            </h2>
            <ProductReviewForm productId={productQuery.data.id} />
            <div className="mt-4">
              {reviewsQuery.isLoading ? (
                <p className="text-sm text-zinc-600">جاري تحميل التقييمات…</p>
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
          </section>

          <section className="mt-16 min-w-0 border-t border-border pt-12">
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
                <ProductGrid
                  className="lg:grid-cols-4"
                  status={
                    relatedQuery.isLoading
                      ? "loading"
                      : relatedProducts.length === 0
                        ? "empty"
                        : "ready"
                  }
                  loading={
                    <>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <ProductSkeleton key={index} />
                      ))}
                    </>
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
          </section>
        </>
      )}
    </Container>
  );
}
