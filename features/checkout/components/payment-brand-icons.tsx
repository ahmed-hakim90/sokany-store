"use client";

import { CreditCard, Smartphone, Wallet } from "lucide-react";

/**
 * أيقونات فقط لشبكات الدفع المصرية الشائعة (مدى / ميزة + محافظ).
 * شعارات تجارية كاملة غير مستخدمة هنا؛ الألوان تقريبية للتمييز البصري فقط.
 */
export function PaymentBrandStrip() {
  return (
    <div className="mt-2">
      <span className="sr-only">
        يدعم بطاقات مدى وميزة، والمحافظ الإلكترونية على الجوال في مصر — حسب تفعيل بوابة
        الدفع في المتجر.
      </span>
      <div
        className="flex flex-wrap items-center gap-1.5"
        aria-hidden
      >
        <span
          className="inline-flex h-8 w-9 items-center justify-center rounded-md bg-[#3d7d3e] text-white shadow-sm"
          title="مدى"
        >
          <CreditCard className="h-4 w-4" strokeWidth={2} />
        </span>
        <span
          className="inline-flex h-8 w-9 items-center justify-center rounded-md bg-[#5c3d8c] text-white shadow-sm"
          title="ميزة"
        >
          <CreditCard className="h-4 w-4" strokeWidth={2} />
        </span>
        <span
          className="inline-flex h-8 w-9 items-center justify-center rounded-md bg-brand-950 text-white shadow-sm"
          title="محفظة إلكترونية"
        >
          <Wallet className="h-4 w-4" strokeWidth={2} />
        </span>
        <span
          className="inline-flex h-8 w-9 items-center justify-center rounded-md bg-brand-900 text-white shadow-sm"
          title="محفظة على الجوال"
        >
          <Smartphone className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}
