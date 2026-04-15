"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { inputSurfaceClass } from "@/lib/ui-input";
import { cn } from "@/lib/utils";

export function CheckoutCouponRow() {
  const [code, setCode] = useState("");

  const apply = () => {
    const t = code.trim();
    if (!t) {
      toast.message("أدخل رمز الكوبون");
      return;
    }
    toast.info("الكوبونات غير مفعّلة في الوضع التجريبي — تم تسجيل الرمز للعرض فقط.");
  };

  return (
    <div className="flex items-stretch gap-2 rounded-2xl border border-border/80 bg-white p-1.5 shadow-[0_6px_22px_-14px_rgba(15,23,42,0.18)]">
      <label className="sr-only" htmlFor="checkout-coupon">
        رمز الخصم
      </label>
      <input
        id="checkout-coupon"
        name="coupon"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="أدخل رمز الكوبون"
        className={cn(
          inputSurfaceClass({ compact: true }),
          "min-w-0 flex-1 border-transparent bg-page/40 py-2.5 shadow-none focus-visible:bg-white",
        )}
      />
      <Button
        type="button"
        size="sm"
        className="h-auto shrink-0 rounded-xl px-4 text-xs font-bold"
        onClick={apply}
      >
        تطبيق
      </Button>
    </div>
  );
}
