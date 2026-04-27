"use client";

import { FormField } from "@/components/ui/form-field";
import { SearchableSelectField } from "@/components/ui/searchable-select-field";
import { Card } from "@/components/ui/card";
import { CheckoutSectionChip } from "@/features/checkout/components/checkout-section-chip";
import { EGYPT_GOVERNORATES } from "@/features/checkout/data/egypt-governorates";
import type { CheckoutFormData } from "@/features/checkout/types";
import { cn } from "@/lib/utils";

const GOVERNORATE_OPTIONS = EGYPT_GOVERNORATES.map((governorate) => ({
  value: governorate.code,
  label: governorate.nameAr,
}));

export type CheckoutShippingFormProps = {
  values: CheckoutFormData;
  errors: Partial<Record<keyof CheckoutFormData, string>>;
  onChange: (key: keyof CheckoutFormData, value: string) => void;
};

function FieldSep() {
  return <div className="h-px  bg-border/70" aria-hidden />;
}

export function CheckoutShippingForm({
  values,
  errors,
  onChange,
}: CheckoutShippingFormProps) {
  const handleGovernorateChange = (code: string) => {
    const governorate = EGYPT_GOVERNORATES.find((item) => item.code === code);
    onChange("shippingStateCode", governorate?.code ?? "");
    onChange("shippingState", governorate?.nameAr ?? "");
  };

  return (
    <Card
      variant="summary"
      className={cn(
        "rounded-2xl border-black/[0.05] p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] sm:p-5",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold tracking-tight text-brand-950">
          بيانات العميل والتوصيل
        </h2>
        <CheckoutSectionChip>مطلوب</CheckoutSectionChip>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">بيانات العميل</p>
          <div className="space-y-3">
            <FormField
              label="الاسم الأول"
              id="contactFirstName"
              name="contactFirstName"
              value={values.contactFirstName}
              onChange={(e) => onChange("contactFirstName", e.target.value)}
              error={errors.contactFirstName}
              autoComplete="given-name"
              required
            />
            <FormField
              label="اسم العائلة"
              id="contactLastName"
              name="contactLastName"
              value={values.contactLastName}
              onChange={(e) => onChange("contactLastName", e.target.value)}
              error={errors.contactLastName}
              autoComplete="family-name"
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
              helperText="للتواصل وإرسال تحديثات الطلب"
              autoComplete="email"
              required
            />
            <FormField
              label="رقم الجوال"
              id="contactPhone"
              name="contactPhone"
              inputMode="tel"
              placeholder="مثال: 01xxxxxxxxx"
              value={values.contactPhone}
              onChange={(e) => onChange("contactPhone", e.target.value)}
              error={errors.contactPhone}
              autoComplete="tel"
              required
            />
          </div>
        </div>

        <FieldSep />

        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">عنوان التوصيل</p>
          <div className="space-y-3">
            <FormField
              label="الاسم الأول (مستلم الطلب)"
              id="shippingFirstName"
              name="shippingFirstName"
              value={values.shippingFirstName}
              onChange={(e) => onChange("shippingFirstName", e.target.value)}
              error={errors.shippingFirstName}
              autoComplete="shipping given-name"
              required
            />
            <FormField
              label="اسم العائلة (مستلم الطلب)"
              id="shippingLastName"
              name="shippingLastName"
              value={values.shippingLastName}
              onChange={(e) => onChange("shippingLastName", e.target.value)}
              error={errors.shippingLastName}
              autoComplete="shipping family-name"
              required
            />
            <FormField
              label="العنوان بالتفصيل"
              id="shippingAddress1"
              name="shippingAddress1"
              placeholder="الشارع، المنطقة، رقم العقار…"
              value={values.shippingAddress1}
              onChange={(e) => onChange("shippingAddress1", e.target.value)}
              error={errors.shippingAddress1}
              autoComplete="shipping address-line1"
              required
            />
            <FormField
              label="شقة / دور / علامة مميزة (اختياري)"
              id="shippingAddress2"
              name="shippingAddress2"
              placeholder="شقة، دور، علامة قريبة من العنوان…"
              value={values.shippingAddress2}
              onChange={(e) => onChange("shippingAddress2", e.target.value)}
              error={errors.shippingAddress2}
              autoComplete="shipping address-line2"
            />
            <FormField
              label="المدينة / القرية"
              id="shippingCity"
              name="shippingCity"
              value={values.shippingCity}
              onChange={(e) => onChange("shippingCity", e.target.value)}
              error={errors.shippingCity}
              autoComplete="address-level2"
              required
            />
            <SearchableSelectField
              label="المحافظة"
              id="shippingState"
              name="shippingStateCode"
              value={values.shippingStateCode}
              onValueChange={handleGovernorateChange}
              options={GOVERNORATE_OPTIONS}
              placeholder="ابحثي عن المحافظة"
              helperText="سيتم إرسال اسم المحافظة مع الطلب وكودها للإدارة."
              error={errors.shippingStateCode ?? errors.shippingState}
              required
            />
            <FormField
              label="الرمز البريدي"
              id="shippingPostcode"
              name="shippingPostcode"
              placeholder="مثال: 12511 — أو - إن لم يُستخدم"
              value={values.shippingPostcode}
              onChange={(e) => onChange("shippingPostcode", e.target.value)}
              error={errors.shippingPostcode}
              autoComplete="postal-code"
              required
            />
            <FormField
              label="الدولة"
              id="shippingCountry"
              name="shippingCountry"
              placeholder="EG"
              helperText="رمز الدولة (مصر: EG)"
              value={values.shippingCountry}
              onChange={(e) => onChange("shippingCountry", e.target.value)}
              error={errors.shippingCountry}
              autoComplete="country"
              required
            />
          </div>
        </div>

        <FieldSep />

        <div className="rounded-xl border border-border/60 bg-surface-muted/40 px-3 py-2.5 text-center text-xs text-muted-foreground">
          الشحن مجاني — لا حاجة لاختيار طريقة توصيل إضافية.
        </div>
      </div>
    </Card>
  );
}
