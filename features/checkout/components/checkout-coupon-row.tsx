"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { Button } from "@/components/Button";
import { inputSurfaceClass } from "@/lib/ui-input";
import { cn } from "@/lib/utils";

export type CheckoutCouponRowProps = {
  appliedCoupon: string | null;
  onApply: (code: string) => void;
  onRemove: () => void;
};

export function CheckoutCouponRow({
  appliedCoupon,
  onApply,
  onRemove,
}: CheckoutCouponRowProps) {
  const [code, setCode] = useState("");

  const apply = () => {
    const t = code.trim();
    onApply(t);
    if (t) {
      setCode("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-white p-1.5 shadow-[0_6px_22px_-14px_rgba(15,23,42,0.18)]">
        <label className="sr-only" htmlFor="checkout-coupon">
          رمز الخصم
        </label>
        <input
          id="checkout-coupon"
          name="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={appliedCoupon ? "استبدال رمز الكوبون" : "أدخل رمز الكوبون"}
          className={cn(
            inputSurfaceClass({ compact: true }),
            "h-10 min-w-0 flex-1 border-transparent bg-page/40 py-0 shadow-none focus-visible:bg-white",
          )}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              apply();
            }
          }}
        />
        <Button
          type="button"
          size="md"
          className="h-10 shrink-0 rounded-xl px-4 text-sm font-bold"
          onClick={apply}
        >
          تطبيق
        </Button>
      </div>
      {appliedCoupon ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-800">
          <span className="flex min-w-0 items-center gap-2">
            <Tag className="h-4 w-4 shrink-0" aria-hidden />
            <span className="min-w-0">
              تم حفظ الكود:{" "}
              <strong className="font-bold" dir="ltr">
                {appliedCoupon}
              </strong>{" "}
              — سيُطبق عند التأكيد
            </span>
          </span>
          <button
            type="button"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-emerald-800 shadow-sm transition hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            onClick={onRemove}
            aria-label="إزالة الكوبون"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
