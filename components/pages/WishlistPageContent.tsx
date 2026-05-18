"use client";

import { useTransitionRouter } from "next-view-transitions";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { StorefrontEmptyState } from "@/components/StorefrontEmptyState";
import { ProductCarouselRow } from "@/features/products/components/product-carousel-row";
import { useProducts } from "@/features/products/hooks/useProducts";
import { WishlistDrawerLines } from "@/features/wishlist/components/wishlist-drawer-lines";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { ROUTES } from "@/lib/constants";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

/*
 * صفحة المفضلة (/wishlist):
 * — الجوال: عنوان ثم قائمة بطاقات premium أو حالة فارغة مع توصيات.
 * — من md: عرض أوسع (max-w-3xl) لبطاقات أفقية مثل درج المفضلة.
 */
export function WishlistPageContent() {
  const router = useTransitionRouter();
  const { hasHydrated, items, removeFromWishlist } = useWishlist();
  const { getCartLineQuantity, setProductLineQuantity } = useCart();
  const isEmpty = items.length === 0;
  const bestSellersQuery = useProducts(
    { orderby: "popularity", per_page: 8 },
    { enabled: hasHydrated && isEmpty },
  );
  const carouselStatus = bestSellersQuery.isLoading
    ? "loading"
    : (bestSellersQuery.data?.items.length ?? 0) > 0
      ? "ready"
      : "empty";

  if (!hasHydrated) {
    return (
      <Container className="w-full min-w-0 max-w-full py-8 sm:py-10">
        <h1 className="font-display text-xl font-semibold text-balance text-brand-950 sm:text-2xl md:text-3xl">
          المفضلة
        </h1>
        <p className="mt-4 rounded-xl border border-border bg-surface-muted/30 px-4 py-3 text-sm text-brand-900">
          جاري التحميل…
        </p>
      </Container>
    );
  }

  return (
    <Container className="w-full min-w-0 max-w-full py-6 sm:py-8 md:py-10">
      <div className="mx-auto w-full min-w-0 max-w-3xl">
        <h1 className="font-display text-xl font-semibold text-balance text-brand-950 sm:text-2xl md:text-3xl">
          المفضلة
        </h1>
        <p className="mt-1 text-pretty text-sm text-muted-foreground sm:text-base">
          المنتجات التي حفظتها للمراجعة لاحقاً.
        </p>

        {isEmpty ? (
          <div className="mt-8 space-y-8">
            <StorefrontEmptyState
              title="المفضلة فارغة"
              description="احفظ المنتجات التي تعجبك لتعود إليها لاحقاً."
              action={
                <Button
                  type="button"
                  variant="commerce"
                  size="lg"
                  className="px-8"
                  onClick={() => router.push(ROUTES.PRODUCTS)}
                >
                  تصفح المنتجات
                </Button>
              }
            />
            <section aria-labelledby="wishlist-bestsellers-heading">
              <h2
                id="wishlist-bestsellers-heading"
                className="font-display text-base font-semibold text-brand-950 sm:text-lg"
              >
                الأكثر مبيعاً
              </h2>
              <ProductCarouselRow
                className="mt-4"
                status={carouselStatus}
                products={bestSellersQuery.data?.items ?? []}
                getCartLineQuantity={getCartLineQuantity}
                onCartLineQuantityChange={setProductLineQuantity}
              />
            </section>
          </div>
        ) : (
          <div
            className={cn(surfacePanelClass, "mt-6 w-full min-w-0 p-3 sm:mt-8 sm:p-4")}
          >
            <WishlistDrawerLines
              variant="premium"
              items={items}
              onRemove={removeFromWishlist}
            />
          </div>
        )}
      </div>
    </Container>
  );
}
