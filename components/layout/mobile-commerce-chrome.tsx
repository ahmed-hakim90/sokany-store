"use client";

import { usePathname, useRouter } from "next/navigation";
import { CartSummaryBar } from "@/features/cart/components/CartSummaryBar";
import { useCart } from "@/hooks/useCart";
import { ROUTES } from "@/lib/constants";
import { BottomNavInner } from "@/components/layout/bottom-nav";

export function MobileCommerceChrome() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, totalPrice, items } = useCart();

  const hideFloatingCart =
    pathname === ROUTES.CART || pathname === ROUTES.CHECKOUT;

  const showCartSummary = totalItems > 0 && !hideFloatingCart;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pt-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="pointer-events-auto mx-auto max-w-lg overflow-hidden rounded-2xl bg-white shadow-[0_-6px_24px_-8px_rgba(15,23,42,0.12),0_-1px_0_rgba(15,23,42,0.06)] ring-1 ring-slate-900/[0.05]">
        {showCartSummary ? (
          <div className="border-b border-border/80 bg-white px-3 py-2">
            <CartSummaryBar
              totalItems={totalItems}
              totalPrice={totalPrice}
              lineCount={items.length}
              onCheckout={() => router.push(ROUTES.CHECKOUT)}
              className="border-0 shadow-md"
            />
          </div>
        ) : null}
        <BottomNavInner />
      </div>
    </div>
  );
}
