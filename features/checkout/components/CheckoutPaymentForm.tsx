"use client";

import { type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { CheckoutSectionChip } from "@/features/checkout/components/checkout-section-chip";
import { PaymentBrandStrip } from "@/features/checkout/components/payment-brand-icons";
import { PaymentOptionCard } from "@/features/checkout/components/payment-option-card";
import type { CheckoutFormData } from "@/features/checkout/types";

export type CheckoutPaymentFormProps = {
  values: CheckoutFormData;
  errors: Partial<Record<keyof CheckoutFormData, string>>;
  onPaymentMethodChange: (value: CheckoutFormData["paymentMethod"]) => void;
};

const PAYMENT_OPTIONS: {
  value: CheckoutFormData["paymentMethod"];
  title: string;
  description: string;
  extra?: ReactNode;
}[] = [
  {
    value: "cod",
    title: "الدفع عند الاستلام",
    description: "ادفع نقداً أو ببطاقة عند استلام الطلب من المندوب.",
  },
  {
    value: "card",
    title: "بطاقة بنكية أو محفظة",
    description:
      "بطاقات مدى أو ميزة، أو محافظ إلكترونية مصرية على الجوال — حسب تفعيل بوابة الدفع في المتجر.",
    extra: <PaymentBrandStrip />,
  },
];

export function CheckoutPaymentForm({
  values,
  errors,
  onPaymentMethodChange,
}: CheckoutPaymentFormProps) {
  return (
    <Card
      variant="summary"
      className="space-y-4 rounded-2xl border-black/[0.05] p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="checkout-payment-heading"
          className="font-display text-lg font-semibold tracking-tight text-brand-950"
        >
          طريقة الدفع
        </h2>
        <CheckoutSectionChip>آمن</CheckoutSectionChip>
      </div>

      <div className="space-y-2.5" role="radiogroup" aria-labelledby="checkout-payment-heading">
        {PAYMENT_OPTIONS.map((opt) => (
          <PaymentOptionCard
            key={opt.value}
            title={opt.title}
            description={opt.description}
            extra={opt.extra}
            selected={values.paymentMethod === opt.value}
            onSelect={() => onPaymentMethodChange(opt.value)}
          />
        ))}
      </div>
      {errors.paymentMethod ? (
        <p className="text-start text-xs text-red-600" role="alert">
          {errors.paymentMethod}
        </p>
      ) : null}
    </Card>
  );
}
