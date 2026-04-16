"use client";

import { FormField } from "@/components/ui/form-field";
import { Card } from "@/components/ui/card";
import { CheckoutSectionChip } from "@/features/checkout/components/checkout-section-chip";
import { CheckoutShippingMethodCards } from "@/features/checkout/components/checkout-shipping-method-cards";
import type { CheckoutFormData } from "@/features/checkout/types";
import { cn } from "@/lib/utils";

export type CheckoutShippingFormProps = {
  values: CheckoutFormData;
  errors: Partial<Record<keyof CheckoutFormData, string>>;
  onChange: (key: keyof CheckoutFormData, value: string) => void;
  onShippingMethodChange: (value: CheckoutFormData["shippingMethod"]) => void;
};

function FieldSep() {
  return <div className="h-px  bg-border/70" aria-hidden />;
}

export function CheckoutShippingForm({
  values,
  errors,
  onChange,
  onShippingMethodChange,
}: CheckoutShippingFormProps) {
  return (
    <Card
      variant="summary"
      className={cn(
        "rounded-2xl border-black/[0.05] p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] sm:p-5",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold tracking-tight text-brand-950">
          تفاصيل الشحن
        </h2>
        <CheckoutSectionChip>مطلوب</CheckoutSectionChip>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">بيانات التواصل</p>
          <div className="space-y-3">
            <FormField
              label="الاسم الأول"
              id="contactFirstName"
              name="contactFirstName"
              value={values.contactFirstName}
              onChange={(e) => onChange("contactFirstName", e.target.value)}
              error={errors.contactFirstName}
              required
            />
            <FormField
              label="اسم العائلة"
              id="contactLastName"
              name="contactLastName"
              value={values.contactLastName}
              onChange={(e) => onChange("contactLastName", e.target.value)}
              error={errors.contactLastName}
              required
            />
            <FormField
              label="البريد الإلكتروني"
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={values.contactEmail}
              onChange={(e) => onChange("contactEmail", e.target.value)}
              error={errors.contactEmail}
              required
            />
            <FormField
              label="رقم الهاتف"
              id="contactPhone"
              name="contactPhone"
              inputMode="tel"
              value={values.contactPhone}
              onChange={(e) => onChange("contactPhone", e.target.value)}
              error={errors.contactPhone}
              required
            />
          </div>
        </div>

        <FieldSep />

        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">عنوان الشحن</p>
          <div className="space-y-3">
            <FormField
              label="الاسم الأول (الشحن)"
              id="shippingFirstName"
              name="shippingFirstName"
              value={values.shippingFirstName}
              onChange={(e) => onChange("shippingFirstName", e.target.value)}
              error={errors.shippingFirstName}
              required
            />
            <FormField
              label="اسم العائلة (الشحن)"
              id="shippingLastName"
              name="shippingLastName"
              value={values.shippingLastName}
              onChange={(e) => onChange("shippingLastName", e.target.value)}
              error={errors.shippingLastName}
              required
            />
            <FormField
              label="عنوان الشحن — السطر 1"
              id="shippingAddress1"
              name="shippingAddress1"
              value={values.shippingAddress1}
              onChange={(e) => onChange("shippingAddress1", e.target.value)}
              error={errors.shippingAddress1}
              required
            />
            <FormField
              label="عنوان الشحن — السطر 2 (اختياري)"
              id="shippingAddress2"
              name="shippingAddress2"
              value={values.shippingAddress2}
              onChange={(e) => onChange("shippingAddress2", e.target.value)}
              error={errors.shippingAddress2}
            />
            <FormField
              label="المدينة"
              id="shippingCity"
              name="shippingCity"
              value={values.shippingCity}
              onChange={(e) => onChange("shippingCity", e.target.value)}
              error={errors.shippingCity}
              required
            />
            <FormField
              label="المحافظة / المنطقة"
              id="shippingState"
              name="shippingState"
              value={values.shippingState}
              onChange={(e) => onChange("shippingState", e.target.value)}
              error={errors.shippingState}
              required
            />
            <FormField
              label="الرمز البريدي"
              id="shippingPostcode"
              name="shippingPostcode"
              value={values.shippingPostcode}
              onChange={(e) => onChange("shippingPostcode", e.target.value)}
              error={errors.shippingPostcode}
              required
            />
            <FormField
              label="رمز الدولة"
              id="shippingCountry"
              name="shippingCountry"
              value={values.shippingCountry}
              onChange={(e) => onChange("shippingCountry", e.target.value)}
              error={errors.shippingCountry}
              required
            />
          </div>
        </div>

        <FieldSep />

        <CheckoutShippingMethodCards
          embedded
          value={values.shippingMethod}
          onChange={onShippingMethodChange}
          error={errors.shippingMethod}
        />
      </div>
    </Card>
  );
}
