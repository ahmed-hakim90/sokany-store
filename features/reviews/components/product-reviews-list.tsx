"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Review } from "@/features/reviews/types";
import { ReviewItemCard } from "@/features/reviews/components/review-item-card";

type ProductReviewsListProps = {
  reviews: Review[];
  className?: string;
};

/*
 * أقل من ‎md: سلايد أفقي — تقييم واحد (بطاقة مركّزة) مع snap وأزرار ونقاط.
 * ‎md فما فوق: قائمة عمودية.
 */
export function ProductReviewsList({ reviews, className }: ProductReviewsListProps) {
  return (
    <div className={className}>
      <div className="md:hidden" dir="ltr">
        <MobileReviewsCarousel reviews={reviews} />
      </div>
      <ul className="hidden list-none space-y-4 p-0 md:block">
        {reviews.map((review) => (
          <li key={review.id}>
            <ReviewItemCard review={review} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = reviews.length;

  const syncIndexFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const slideW = el.offsetWidth;
    if (slideW <= 0) return;
    setIndex(Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / slideW))));
  }, [count]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      requestAnimationFrame(syncIndexFromScroll);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    syncIndexFromScroll();
    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, [syncIndexFromScroll, count, reviews]);

  const goTo = useCallback(
    (next: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const nextIndex = Math.min(count - 1, Math.max(0, next));
      el.scrollTo({
        left: nextIndex * el.offsetWidth,
        behavior: "smooth",
      });
      setIndex(nextIndex);
    },
    [count],
  );

  if (count === 0) return null;

  return (
    <div>
      <div
        className="relative w-full"
        role="region"
        aria-label="تقييمات المنتج"
        aria-roledescription="شريط تمرير"
      >
        <div
          ref={scrollerRef}
          className={cn(
            "flex w-full touch-pan-x snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "scroll-smooth",
          )}
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="w-full min-w-0 flex-[0_0_100%] snap-center px-1"
            >
              <div className="mx-auto w-full max-w-md">
                <ReviewItemCard review={review} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {count > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition enabled:hover:bg-surface-muted disabled:opacity-40"
            aria-label="التقييم السابق"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <div className="flex min-w-0 items-center justify-center gap-1.5 px-2" aria-label="اختيار التقييم">
            {reviews.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 rounded-full p-0 transition-all",
                  i === index
                    ? "w-4 bg-brand-500"
                    : "w-1.5 bg-zinc-300 hover:bg-zinc-400",
                )}
                aria-label={`تقييم ${i + 1} من ${count}`}
                aria-pressed={i === index}
              />
            ))}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground" aria-live="polite">
            {index + 1} / {count}
          </span>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index >= count - 1}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition enabled:hover:bg-surface-muted disabled:opacity-40"
            aria-label="التقييم التالي"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
