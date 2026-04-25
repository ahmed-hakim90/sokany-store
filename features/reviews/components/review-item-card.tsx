import { cn } from "@/lib/utils";
import type { Review } from "@/features/reviews/types";
import { formatReviewDate } from "@/features/reviews/lib/formatReviewDate";
import { ReviewRatingReadonly } from "@/features/reviews/components/review-rating-readonly";

type ReviewItemCardProps = {
  review: Review;
  className?: string;
};

export function ReviewItemCard({ review, className }: ReviewItemCardProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)]",
        className,
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-950">{review.reviewer}</p>
          <time
            className="mt-0.5 block text-xs text-zinc-500"
            dateTime={review.dateCreated}
          >
            {formatReviewDate(review.dateCreated)}
          </time>
        </div>
        <ReviewRatingReadonly rating={review.rating} className="shrink-0 sm:ms-auto" size="md" />
      </div>
      <p className="mt-3 break-words text-sm text-zinc-700">{review.review}</p>
    </article>
  );
}
