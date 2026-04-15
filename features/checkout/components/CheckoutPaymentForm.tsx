"use client";

import { useId } from "react";
import { Card } from "@/components/ui/card";
import { CheckoutSectionChip } from "@/features/checkout/components/checkout-section-chip";
import { PaymentOptionCard } from "@/features/checkout/components/payment-option-card";
import { inputSurfaceClass } from "@/lib/ui-input";
import { cn } from "@/lib/utils";
import type { CheckoutFormData } from "@/features/checkout/types";

export type CheckoutPaymentFormProps = {
  values: CheckoutFormData;
  errors: Partial<Record<keyof CheckoutFormData, string>>;
  onPaymentMethodChange: (value: CheckoutFormData["paymentMethod"]) => void;
  onCustomerNoteChange: (value: string) => void;
};

const PAYMENT_OPTIONS: {
  value: CheckoutFormData["paymentMethod"];
  title: string;
  description: string;
}[] = [
  {
    value: "cod",
    title: "الدفع عند الاستلام",
    description: "ادفع نقداً عند استلام الطلب.",
  },
  {
    value: "card",
    title: "بطاقة بنكية",
    description: "تجريبي — لا يتم خصم أي مبلغ حالياً.",
  },
];

export function CheckoutPaymentForm({
  values,
  errors,
  onPaymentMethodChange,
  onCustomerNoteChange,
}: CheckoutPaymentFormProps) {
  const noteId = useId();
  const invalidNote = Boolean(errors.customerNote);

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

      <div className="border-t border-border/70 pt-3">
        <label htmlFor={noteId} className="text-start text-xs font-medium text-muted-foreground">
          ملاحظات الطلب (اختياري)
        </label>
        <textarea
          id={noteId}
          name="customerNote"
          rows={2}
          value={values.customerNote}
          onChange={(e) => onCustomerNoteChange(e.target.value)}
          className={cn(inputSurfaceClass({ invalid: invalidNote }), "mt-1.5 min-h-[72px] resize-none")}
          aria-invalid={invalidNote}
        />
        {errors.customerNote ? (
          <p className="mt-1 text-start text-xs text-red-600" role="alert">
            {errors.customerNote}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
