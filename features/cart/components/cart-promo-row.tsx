"use client";

import { useId, useState } from "react";
import { Check, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { inputSurfaceClass } from "@/lib/ui-input";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

type PromoUiState = "idle" | "applied" | "error";

/**
 * Slim promo field on cart — mirrors checkout intent; real application happens at payment.
 */
export function CartPromoRow({ className }: { className?: string }) {
  const inputId = useId();
  const [code, setCode] = useState("");
  const [uiState, setUiState] = useState<PromoUiState>("idle");
  const [appliedCode, setAppliedCode] = useState("");

  const apply = () => {
    const t = code.trim();
    if (!t) {
      setUiState("error");
      return;
    }
    if (t.length < 3) {
      setUiState("error");
      return;
    }
    setUiState("applied");
    setAppliedCode(t);
    toast.info(
      "سيتم التحقق من الكوبون عند إتمام الطلب — أكمل خطوات الدفع لتطبيق الخصم.",
    );
  };

  const clearApplied = () => {
    setUiState("idle");
    setAppliedCode("");
    setCode("");
  };

  return (
    <div className={cn(surfacePanelClass, "p-3", className)}>
      <div className="mb-2 flex items-center gap-2">
        <Tag className="h-4 w-4 text-brand-800" aria-hidden />
        <p className="text-xs font-bold text-brand-950">رمز الخصم</p>
      </div>

      {uiState === "applied" ? (
        <div
          className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2.5"
          role="status"
        >
          <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-emerald-800">
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate" dir="ltr">
              {appliedCode}
            </span>
            <span className="text-xs font-medium text-emerald-700">— يُطبَّق عند الدفع</span>
          </span>
          <button
            type="button"
            className="shrink-0 rounded-lg p-1 text-emerald-700 transition-colors hover:bg-emerald-100"
            aria-label="إزالة رمز الخصم"
            onClick={clearApplied}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : (
        <>
          {uiState === "error" ? (
            <p className="mb-2 text-xs font-medium text-red-700" role="alert">
              {code.trim().length === 0
                ? "أدخل رمز الكوبون أولاً."
                : "رمز الكوبون قصير جداً — تحقق من الرمز وحاول مرة أخرى."}
            </p>
          ) : null}
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border bg-page/30 p-1",
              uiState === "error" ? "border-red-200" : "border-border/60",
            )}
          >
            <label className="sr-only" htmlFor={inputId}>
              رمز الخصم
            </label>
            <input
              id={inputId}
              name="cart-coupon"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (uiState === "error") setUiState("idle");
              }}
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
        </>
      )}
    </div>
  );
}
