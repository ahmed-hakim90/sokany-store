"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";
import { isAxiosError } from "axios";
import { Button } from "@/components/Button";
import { FormField } from "@/components/ui/form-field";
import { useCreateReview } from "@/features/reviews/hooks/useCreateReview";
import { ReviewStarRating } from "@/features/reviews/components/review-star-rating";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { cn } from "@/lib/utils";
import { inputSurfaceClass } from "@/lib/ui-input";

const baseFields = { review: "", rating: 5 };

export function ProductReviewForm({ productId }: { productId: number }) {
  const user = useAuthStore((s) => s.user);
  const [fields, setFields] = useState(() => ({
    ...baseFields,
    reviewer: user?.displayName?.trim() ?? "",
    reviewerEmail: user?.email?.trim() ?? "",
  }));
  const createReview = useCreateReview(productId);
  const reviewer = user?.displayName?.trim() || fields.reviewer;
  const reviewerEmail = user?.email?.trim() || fields.reviewerEmail;

  const submit = () => {
    createReview.mutate(
      {
        productId,
        reviewer,
        reviewerEmail,
        review: fields.review,
        rating: fields.rating,
      },
      {
        onSuccess: () => {
          setFields((p) => ({ ...baseFields, reviewer: p.reviewer, reviewerEmail: p.reviewerEmail }));
          toast.success("شكراً، تم إرسال تقييمك.");
        },
        onError: (error) => {
          if (error instanceof ZodError) {
            toast.error(error.issues[0]?.message ?? "تحقق من الحقول.");
            return;
          }
          if (isAxiosError(error) && error.response?.status === 403) {
            const code = (error.response.data as { error?: string })?.error;
            if (code === "REVIEW_NOT_ELIGIBLE") {
              toast.error("لا تتوفر صلاحية إضافة التقييم لهذا المنتج.");
              return;
            }
          }
          toast.error("تعذر إرسال التقييم. حاول مرة أخرى.");
        },
      },
    );
  };

  return (
    <div className="mt-6 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_2px_16px_-4px_rgba(15,23,42,0.07)] sm:p-5">
      <h3 className="font-display text-base font-semibold text-brand-950">أضف تقييماً</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <FormField
          label="الاسم"
          value={reviewer}
          onChange={(e) => setFields((p) => ({ ...p, reviewer: e.target.value }))}
          readOnly={Boolean(user?.displayName?.trim())}
          autoComplete="name"
        />
        <FormField
          label="البريد الإلكتروني"
          type="email"
          value={reviewerEmail}
          onChange={(e) => setFields((p) => ({ ...p, reviewerEmail: e.target.value }))}
          readOnly={Boolean(user?.email?.trim())}
          autoComplete="email"
        />
      </div>
      <div className="mt-3 flex w-full min-w-0 flex-col gap-1.5">
        <span className="text-start text-sm font-medium text-brand-900">التقييم</span>
        <ReviewStarRating
          value={fields.rating}
          onChange={(rating) => setFields((p) => ({ ...p, rating }))}
        />
      </div>
      <div className="mt-3 flex w-full min-w-0 flex-col gap-1.5">
        <label className="text-start text-sm font-medium text-brand-900" htmlFor="review-body">
          التعليق
        </label>
        <textarea
          id="review-body"
          rows={4}
          className={cn(
            inputSurfaceClass(),
            "min-h-[5.5rem] w-full min-w-0 resize-y",
          )}
          value={fields.review}
          onChange={(e) => setFields((p) => ({ ...p, review: e.target.value }))}
          placeholder="صف تجربتك مع المنتج…"
        />
      </div>
      <Button
        type="button"
        className="mt-4  sm:w-auto"
        loading={createReview.isPending}
        onClick={() => void submit()}
      >
        إرسال التقييم
      </Button>
    </div>
  );
}
