"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type CatalogInfiniteScrollSentinelProps = {
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  className?: string;
};

/**
 * عنصر مراقبة أسفل شبكة المنتجات — يطلب الصفحة التالية عند الاقتراب من أسفل الشاشة.
 */
export function CatalogInfiniteScrollSentinel({
  hasMore,
  isLoadingMore,
  onLoadMore,
  className,
}: CatalogInfiniteScrollSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoadingMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onLoadMore();
      },
      { root: null, rootMargin: "240px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  if (!hasMore && !isLoadingMore) return null;

  return (
    <div
      ref={sentinelRef}
      className={cn("flex min-h-14 flex-col items-center justify-center py-4", className)}
      aria-live="polite"
      aria-busy={isLoadingMore}
    >
      {isLoadingMore ? (
        <p className="text-sm font-medium text-muted-foreground">جاري تحميل المزيد…</p>
      ) : hasMore ? (
        <span className="sr-only">تحميل المزيد عند التمرير</span>
      ) : null}
    </div>
  );
}
