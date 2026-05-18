"use client";

import { User, UserPlus } from "lucide-react";
import type { CheckoutFormData } from "@/features/checkout/types";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

function hasSavedContact(values: CheckoutFormData): boolean {
  return Boolean(
    values.contactFirstName.trim() ||
      values.contactLastName.trim() ||
      values.contactPhone.trim() ||
      values.shippingAddress1.trim(),
  );
}

export type CheckoutSessionBannerProps = {
  values: CheckoutFormData;
  className?: string;
};

/**
 * عرض فقط: يوضح وضع الضيف مقابل إنشاء حساب، وإن وُجدت بيانات محفوظة محلياً.
 */
export function CheckoutSessionBanner({
  values,
  className,
}: CheckoutSessionBannerProps) {
  const saved = hasSavedContact(values);

  return (
    <div
      className={cn(surfacePanelClass, "flex flex-col gap-2 p-3 sm:p-4", className)}
      role="status"
    >
      <div className="flex items-start gap-2.5">
        {values.createAccount ? (
          <UserPlus className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden />
        ) : (
          <User className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden />
        )}
        <div className="min-w-0 text-start">
          <p className="text-sm font-semibold text-brand-950">
            {values.createAccount
              ? "إنشاء حساب مع هذا الطلب"
              : "إتمام الطلب كضيف"}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {values.createAccount
              ? "سيُطلب بريد إلكتروني وكلمة مرور صالحة عند التأكيد."
              : "لا حاجة لحساب — يمكنك متابعة الشراء بالبيانات أدناه فقط."}
          </p>
        </div>
      </div>
      {saved ? (
        <p className="rounded-lg border border-brand-500/20 bg-brand-500/8 px-3 py-2 text-xs leading-relaxed text-brand-900">
          تم استرجاع بياناتك المحفوظة على هذا الجهاز — راجعها قبل التأكيد.
        </p>
      ) : null}
    </div>
  );
}
