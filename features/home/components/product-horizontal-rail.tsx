"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { ErrorState } from "@/components/ErrorState";
import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductWishlistHeart } from "@/features/wishlist/components/ProductWishlistHeart";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";
import type { Product } from "@/features/products/types";
import { useRailScrollNav } from "@/hooks/useRailScrollNav";
import { cn } from "@/lib/utils";

const railScrollBase =
  "flex flex-nowrap snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2";

/** Hidden scrollbar on small screens; thin scrollbar on md+ for desktop affordance. */
const railScrollScrollbar =
  "max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden md:[scrollbar-width:thin] md:[scrollbar-color:var(--sokany-accent)_var(--sokany-muted-bg)] md:[&::-webkit-scrollbar]:h-2 md:[&::-webkit-scrollbar-track]:rounded-full md:[&::-webkit-scrollbar-track]:bg-[var(--sokany-muted-bg)] md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-[var(--sokany-accent)]";

const railScrollClass = cn(railScrollBase, railScrollScrollbar);

const cardShellClass = "w-[148px] shrink-0 snap-start sm:w-[168px] md:w-[184px]";

export type ProductHorizontalRailStatus = "loading" | "empty" | "ready" | "error";

export type ProductHorizontalRailProps = {
  status: ProductHorizontalRailStatus;
  products?: Product[];
  getCartLineQuantity?: (productId: number) => number;
  onCartLineQuantityChange?: (product: Product, next: number) => void;
  empty?: ReactNode;
  errorMessage?: string;
  onRetry?: () => void;
  skeletonCount?: number;
  /** Eager image slots for LCP; use 0 on home so only the hero uses priority. @default 3 */
  priorityImageSlots?: number;
  /** @default false */
  simpleImageMode?: boolean;
  /** @default true */
  imageMotion?: boolean;
  "aria-label"?: string;
  className?: string;
};

function RailNavButtons({
  canScroll,
  atStart,
  atEnd,
  onPrev,
  onNext,
}: {
  canScroll: boolean;
  atStart: boolean;
  atEnd: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!canScroll) return null;

  return (
    <>
      <button
        type="button"
        className="absolute start-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-foreground shadow-md backdrop-blur-sm transition-opacity hover:bg-white md:flex"
        disabled={atStart}
        aria-label="السابق"
        onClick={onNext}
      >
        <Chevron direction="next" />
      </button>
      <button
        type="button"
        className="absolute end-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-foreground shadow-md backdrop-blur-sm transition-opacity hover:bg-white md:flex"
        disabled={atEnd}
        aria-label="التالي"
        onClick={onPrev}
      >
        <Chevron direction="prev" />
      </button>
    </>
  );
}

function Chevron({ direction }: { direction: "prev" | "next" }) {
  const rotate = direction === "prev" ? "rotate-90" : "-rotate-90";
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      className={cn(rotate, "shrink-0")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RailScrollWrap({
  children,
  className,
  "aria-label": ariaLabel,
  role,
  layoutKey,
}: {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  role?: "region" | "status";
  layoutKey: string | number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { canScroll, atStart, atEnd, scrollNext, scrollPrev } = useRailScrollNav(
    scrollRef,
    true,
    layoutKey,
  );

  return (
    <div className={cn("relative min-w-0", className)}>
      <div
        ref={scrollRef}
        role={role}
        aria-label={ariaLabel}
        className={cn("min-w-0", railScrollClass)}
      >
        {children}
      </div>
      <RailNavButtons
        canScroll={canScroll}
        atStart={atStart}
        atEnd={atEnd}
        onPrev={scrollPrev}
        onNext={scrollNext}
      />
    </div>
  );
}

export function ProductHorizontalRail({
  status,
  products = [],
  getCartLineQuantity,
  onCartLineQuantityChange,
  empty,
  errorMessage,
  onRetry,
  skeletonCount = 6,
  priorityImageSlots = 3,
  simpleImageMode = false,
  imageMotion = true,
  "aria-label": ariaLabel,
  className,
}: ProductHorizontalRailProps) {
  if (status === "error" && errorMessage) {
    return (
      <ErrorState
        message={errorMessage}
        onRetry={onRetry ? () => void onRetry() : undefined}
      />
    );
  }

  if (status === "empty") {
    return <div className="min-w-0">{empty ?? null}</div>;
  }

  if (status === "loading") {
    return (
      <RailScrollWrap
        role="status"
        aria-label={ariaLabel}
        className={className}
        layoutKey={skeletonCount}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className={cardShellClass}>
            <ProductSkeleton />
          </div>
        ))}
      </RailScrollWrap>
    );
  }

  const layoutKey = products.map((p) => p.id).join(",");

  return (
    <RailScrollWrap role="region" aria-label={ariaLabel} className={className} layoutKey={layoutKey}>
      {products.map((product, index) => (
        <div key={product.id} className={cardShellClass}>
          <ProductCard
            product={product}
            imagePriority={index < priorityImageSlots}
            simpleImageMode={simpleImageMode}
            imageMotion={imageMotion}
            variant="mobileCompact"
            getCartLineQuantity={getCartLineQuantity}
            onCartLineQuantityChange={onCartLineQuantityChange}
            wishlistSlot={<ProductWishlistHeart product={product} />}
          />
        </div>
      ))}
    </RailScrollWrap>
  );
}
