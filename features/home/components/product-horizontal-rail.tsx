"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ErrorState } from "@/components/ErrorState";
import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductWishlistHeart } from "@/features/wishlist/components/ProductWishlistHeart";
import { ProductSkeleton } from "@/features/products/components/ProductSkeleton";
import type { Product } from "@/features/products/types";
import { cn } from "@/lib/utils";

const railScrollBase =
  "flex flex-nowrap snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2";

/** Hidden scrollbar on small screens; thin scrollbar on md+ for desktop affordance. */
const railScrollScrollbar =
  "max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden md:[scrollbar-width:thin] md:[scrollbar-color:rgba(15,23,42,0.35)_transparent] md:[&::-webkit-scrollbar]:h-2 md:[&::-webkit-scrollbar-track]:rounded-full md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-black/25";

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
  "aria-label"?: string;
  className?: string;
};

function useRailScrollNav(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  active: boolean,
  /** Bumps layout probe when this key changes. */
  layoutKey: string | number,
) {
  const [canScroll, setCanScroll] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const scrollNextSign = useRef(1);

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !active) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 2) {
      setCanScroll(false);
      setAtStart(true);
      setAtEnd(true);
      return;
    }
    setCanScroll(true);
    const sl = el.scrollLeft;
    const sign = scrollNextSign.current;
    if (sign > 0) {
      setAtStart(sl <= 2);
      setAtEnd(sl >= max - 2);
    } else {
      setAtStart(sl >= -2);
      setAtEnd(sl <= -max + 2);
    }
  }, [active, scrollRef]);

  const probeScrollSign = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !active) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 2) {
      scrollNextSign.current = 1;
      return;
    }
    const before = el.scrollLeft;
    el.scrollBy({ left: 50, behavior: "auto" });
    const d = el.scrollLeft - before;
    el.scrollBy({ left: -d, behavior: "auto" });
    if (d !== 0) {
      scrollNextSign.current = d > 0 ? 1 : -1;
    }
  }, [active, scrollRef]);

  useLayoutEffect(() => {
    if (!active) return;
    probeScrollSign();
    updateEdges();
  }, [active, layoutKey, probeScrollSign, updateEdges]);

  useEffect(() => {
    if (!active) return;
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      probeScrollSign();
      updateEdges();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, layoutKey, probeScrollSign, updateEdges, scrollRef]);

  useEffect(() => {
    if (!active) return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateEdges();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [active, updateEdges, scrollRef]);

  const scrollNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(220, Math.floor(el.clientWidth * 0.65));
    el.scrollBy({ left: scrollNextSign.current * step, behavior: "smooth" });
  }, [scrollRef]);

  const scrollPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(220, Math.floor(el.clientWidth * 0.65));
    el.scrollBy({ left: -scrollNextSign.current * step, behavior: "smooth" });
  }, [scrollRef]);

  return { canScroll, atStart, atEnd, scrollNext, scrollPrev };
}

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
        onClick={onPrev}
      >
        <Chevron direction="prev" />
      </button>
      <button
        type="button"
        className="absolute end-1 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-foreground shadow-md backdrop-blur-sm transition-opacity hover:bg-white md:flex"
        disabled={atEnd}
        aria-label="التالي"
        onClick={onNext}
      >
        <Chevron direction="next" />
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
      {products.map((product) => (
        <div key={product.id} className={cardShellClass}>
          <ProductCard
            product={product}
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
