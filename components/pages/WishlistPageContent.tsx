"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { WishlistDrawerLines } from "@/features/wishlist/components/wishlist-drawer-lines";
import { useWishlist } from "@/hooks/useWishlist";
import { ROUTES } from "@/lib/constants";

/*
 * صفحة المفضلة (/wishlist): عمود واحد داخل Container؛ على الشاشات الصغيرة حواف مريحة،
 * ومن md فما فوق عرض أقصى للقائمة (max-w-2xl) لتسهيل القراءة.
 */
export function WishlistPageContent() {
  const router = useRouter();
  const { hasHydrated, items, removeFromWishlist } = useWishlist();
  const isEmpty = items.length === 0;

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
      <div className="mx-auto w-full min-w-0 max-w-2xl">
        <h1 className="font-display text-xl font-semibold text-balance text-brand-950 sm:text-2xl md:text-3xl">
          المفضلة
        </h1>
        <p className="mt-1 text-pretty text-sm text-muted-foreground sm:text-base">
          المنتجات التي حفظتها للمراجعة لاحقاً.
        </p>

        {isEmpty ? (
          <div className="mt-8 flex w-full min-w-0 flex-col items-center justify-center gap-4 rounded-2xl border border-border/80 bg-surface-muted/40 px-3 py-10 text-center sm:px-8 sm:py-16">
            <p className="max-w-sm text-pretty text-sm text-muted-foreground sm:max-w-none sm:text-base">
              لا توجد منتجات في المفضلة بعد.
            </p>
            <Button
              type="button"
              variant="primary"
              className="font-bold"
              onClick={() => router.push(ROUTES.PRODUCTS)}
            >
              تصفح المنتجات
            </Button>
          </div>
        ) : (
          <div className="mt-6 w-full min-w-0 sm:mt-8">
            <WishlistDrawerLines items={items} onRemove={removeFromWishlist} />
          </div>
        )}
      </div>
    </Container>
  );
}
