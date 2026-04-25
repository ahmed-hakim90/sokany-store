"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { inputSurfaceClass } from "@/lib/ui-input";
import { cn } from "@/lib/utils";

/**
 * Slim promo field on cart — mirrors checkout intent; real application happens at payment.
 */
export function CartPromoRow({ className }: { className?: string }) {
  const [code, setCode] = useState("");

  const apply = () => {
    const t = code.trim();
    if (!t) {
      toast.message("أدخل رمز الكوبون");
      return;
    }
    toast.info(
      "سيتم التحقق من الكوبون عند إتمام الطلب — أكمل خطوات الدفع لتطبيق الخصم.",
    );
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-white p-3 shadow-[0_6px_22px_-14px_rgba(15,23,42,0.12)]",
        className,
      )}
    >
      <p className="mb-2 text-xs font-medium text-muted-foreground">رمز الخصم</p>
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-page/30 p-1">
        <label className="sr-only" htmlFor="cart-promo-code">
          رمز الخصم
        </label>
        <input
          id="cart-promo-code"
          name="cart-coupon"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="أدخل الكوبون هنا"
          autoComplete="off"
          className={cn(
            inputSurfaceClass({ compact: true }),
            "h-10 min-w-0 flex-1 border-transparent bg-transparent py-0 shadow-none focus-visible:bg-white",
          )}
        />
        <Button
          type="button"
          size="md"
          variant="secondary"
          className="h-10 shrink-0 rounded-lg px-3 text-sm font-bold"
          onClick={apply}
        >
          حفظ
        </Button>
      </div>
    </div>
  );
}
