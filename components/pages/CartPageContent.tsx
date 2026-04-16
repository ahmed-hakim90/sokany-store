"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppImage } from "@/components/AppImage";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { EmptyState } from "@/components/EmptyState";
import { QtyControl } from "@/components/ui/qty-control";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { CartSummaryPanel } from "@/features/cart/components/CartSummaryPanel";

export function CartPageContent() {
  const router = useRouter();
  const { items, totalPrice, isEmpty, updateProductQuantity, removeProduct } =
    useCart();

  return (
    <Container className="py-10">
      <h1 className="font-display text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
        سلة التسوق
      </h1>

      {isEmpty ? (
        <div className="mt-8">
          <EmptyState
            title="السلة فارغة"
            description="أضف بعض المنتجات للبدء."
            action={
              <Button type="button" onClick={() => router.push(ROUTES.PRODUCTS)}>
                تصفح المنتجات
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
          <div className="min-w-0 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col gap-4 rounded-xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)] sm:flex-row sm:items-stretch"
              >
                <div className="relative mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-image-well sm:mx-0">
                  <AppImage
                    src={item.thumbnail}
                    alt={item.name}
                    fill
                    sizes="96px"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={ROUTES.PRODUCT(item.productId)}
                        className="text-sm font-semibold hover:text-brand-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-zinc-600">SKU: {item.sku}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(item.productId)}
                    >
                      إزالة
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-brand-700">
                      {formatPrice(item.price)}
                    </div>
                    <QtyControl
                      value={item.quantity}
                      min={1}
                      max={999}
                      onChange={(quantity) =>
                        updateProductQuantity(item.productId, quantity)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="hidden lg:block">
            <CartSummaryPanel
              items={items}
              subtotal={totalPrice}
              total={totalPrice}
              footer={
                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  onClick={() => router.push(ROUTES.CHECKOUT)}
                >
                  إتمام الطلب
                </Button>
              }
            />
          </aside>
        </div>
      )}
    </Container>
  );
}
