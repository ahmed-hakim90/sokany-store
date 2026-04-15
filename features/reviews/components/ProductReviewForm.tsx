"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";
import { Button } from "@/components/Button";
import { FormField } from "@/components/ui/form-field";
import { useCreateReview } from "@/features/reviews/hooks/useCreateReview";

const initial = {
  reviewer: "",
  reviewerEmail: "",
  review: "",
  rating: 5,
};

export function ProductReviewForm({ productId }: { productId: number }) {
  const [fields, setFields] = useState(initial);
  const createReview = useCreateReview(productId);

  const submit = () => {
    createReview.mutate(
      {
        productId,
        reviewer: fields.reviewer,
        reviewerEmail: fields.reviewerEmail,
        review: fields.review,
        rating: fields.rating,
      },
      {
        onSuccess: () => {
          setFields(initial);
          toast.success("شكراً، تم إرسال تقييمك.");
        },
        onError: (error) => {
          if (error instanceof ZodError) {
            toast.error(error.issues[0]?.message ?? "تحقق من الحقول.");
            return;
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
          value={fields.reviewer}
          onChange={(e) => setFields((p) => ({ ...p, reviewer: e.target.value }))}
          autoComplete="name"
        />
        <FormField
          label="البريد الإلكتروني"
          type="email"
          value={fields.reviewerEmail}
          onChange={(e) => setFields((p) => ({ ...p, reviewerEmail: e.target.value }))}
          autoComplete="email"
        />
      </div>
      <div className="mt-3">
        <label className="text-start text-sm font-medium text-brand-900" htmlFor="review-rating">
          التقييم (1–5)
        </label>
        <select
          id="review-rating"
          className="mt-1.5 flex h-10 w-full max-w-[120px] rounded-md border border-border bg-white px-3 text-sm"
          value={fields.rating}
          onChange={(e) =>
            setFields((p) => ({ ...p, rating: Number.parseInt(e.target.value, 10) || 5 }))
          }
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3">
        <label className="text-start text-sm font-medium text-brand-900" htmlFor="review-body">
          التعليق
        </label>
        <textarea
          id="review-body"
          rows={4}
          className="mt-1.5 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none ring-brand-500 focus-visible:ring-2"
          value={fields.review}
          onChange={(e) => setFields((p) => ({ ...p, review: e.target.value }))}
          placeholder="صف تجربتك مع المنتج…"
        />
      </div>
      <Button
        type="button"
        className="mt-4 w-full sm:w-auto"
        loading={createReview.isPending}
        onClick={() => void submit()}
      >
        إرسال التقييم
      </Button>
    </div>
  );
}
