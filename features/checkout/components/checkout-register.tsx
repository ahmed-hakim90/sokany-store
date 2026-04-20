"use client";

import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CheckoutSectionChip } from "@/features/checkout/components/checkout-section-chip";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { CheckoutFormData } from "@/features/checkout/types";
import { inputSurfaceClass } from "@/lib/ui-input";
import { cn } from "@/lib/utils";

export type CheckoutRegisterProps = {
  values: CheckoutFormData;
  errors: Partial<Record<keyof CheckoutFormData, string>>;
  onCreateAccountChange: (value: boolean) => void;
  onPasswordChange: (value: string) => void;
};

export function CheckoutRegister({
  values,
  errors,
  onCreateAccountChange,
  onPasswordChange,
}: CheckoutRegisterProps) {
  const { hasHydrated, isAuthenticated } = useAuthSession();

  if (!hasHydrated || isAuthenticated) {
    return null;
  }

  return (
    <Card
      variant="summary"
      className={cn(
        "rounded-2xl border border-brand-500/15 bg-gradient-to-br from-white to-brand-500/[0.04] p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] sm:p-5",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <CheckoutSectionChip>حساب</CheckoutSectionChip>
        <h2 className="font-display text-lg font-semibold tracking-tight text-brand-950">
          تتبّع طلباتك لاحقاً
        </h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-brand-900/70">
        اختياري — لا نطلب تسجيلاً قبل الشراء. إن رغبت، ننشئ لك حساباً من نفس بيانات الاتصال أدناه.
      </p>

      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-white/80 p-3 transition-colors hover:bg-surface-muted/30">
        <input
          type="checkbox"
          checked={values.createAccount}
          onChange={(e) => onCreateAccountChange(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 rounded border-border text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        />
        <span className="text-sm font-semibold leading-snug text-brand-950">
          إنشاء حساب ببياناتي لتتبع الطلبات بسهولة
        </span>
      </label>

      {values.createAccount ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-brand-900/60">
            أدخل كلمة سر قوية لتتمكن من الدخول لاحقاً (البريد المستخدم أعلاه هو اسم المستخدم).
          </p>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute right-3 top-1/2 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-brand-900/35"
              aria-hidden
            />
            <input
              type="password"
              autoComplete="new-password"
              placeholder="كلمة السر"
              value={values.accountPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              className={cn(
                inputSurfaceClass,
                "w-full py-3 pe-11 text-sm",
                errors.accountPassword ? "border-red-400 focus-visible:ring-red-400/40" : "",
              )}
              aria-invalid={Boolean(errors.accountPassword)}
            />
          </div>
          {errors.accountPassword ? (
            <p className="text-xs font-medium text-red-600" role="alert">
              {errors.accountPassword}
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
