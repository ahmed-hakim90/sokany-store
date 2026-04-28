"use client";

import { useId, useMemo } from "react";
import { FormField } from "@/components/ui/form-field";
import { SearchableSelectField } from "@/components/ui/searchable-select-field";
import { SelectField } from "@/components/ui/select-field";
import { Card } from "@/components/ui/card";
import { CheckoutSectionChip } from "@/features/checkout/components/checkout-section-chip";
import { getAreasForGovernorateCode } from "@/features/checkout/data/egypt-areas";
import { EGYPT_GOVERNORATES } from "@/features/checkout/data/egypt-governorates";
import type { CheckoutFormData } from "@/features/checkout/types";
import { inputSurfaceClass } from "@/lib/ui-input";
import { cn } from "@/lib/utils";

const GOVERNORATE_OPTIONS = EGYPT_GOVERNORATES.map((governorate) => ({
  value: governorate.code,
  label: governorate.nameAr,
}));

/*
 * بيانات الدفع — عمود واحد RTL؛ الحقول من الأعلى للأسفل كما في مرجع المتجر.
 * من sm: نفس العمود بعرض النموذج؛ لا توجد شبكة داخلية لأن الحقول عمودية بالكامل.
 * أسفل الحقول: ملاحظات الطلب ثم فاصل ثم تذكير الشحن المجاني.
 */
export type CheckoutShippingFormProps = {
  values: CheckoutFormData;
  errors: Partial<Record<keyof CheckoutFormData, string>>;
  onChange: <K extends keyof CheckoutFormData>(
    key: K,
    value: CheckoutFormData[K],
  ) => void;
  onCustomerNoteChange: (value: string) => void;
};

function FieldSep() {
  return <div className="h-px bg-border/70" aria-hidden />;
}

export function CheckoutShippingForm({
  values,
  errors,
  onChange,
  onCustomerNoteChange,
}: CheckoutShippingFormProps) {
  const noteId = useId();
  const invalidNote = Boolean(errors.customerNote);

  const handleGovernorateChange = (code: string) => {
    const governorate = EGYPT_GOVERNORATES.find((item) => item.code === code);
    onChange("shippingStateCode", governorate?.code ?? "");
    onChange("shippingState", governorate?.nameAr ?? "");
    onChange("shippingCity", "");
  };

  const shippingAreaOptions = useMemo(() => {
    const fromGovernorate = [...getAreasForGovernorateCode(values.shippingStateCode)];
    const typed = values.shippingCity.trim();
    if (typed && !fromGovernorate.includes(typed)) {
      fromGovernorate.unshift(typed);
    }
    return [
      { value: "", label: "— بدون تحديد —" },
      ...fromGovernorate.map((name) => ({ value: name, label: name })),
    ];
  }, [values.shippingStateCode, values.shippingCity]);

  return (
    <Card
      variant="summary"
      className={cn(
        "rounded-2xl border-black/[0.05] p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] sm:p-5",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold tracking-tight text-brand-950">
          بيانات الدفع
        </h2>
        <CheckoutSectionChip>مطلوب</CheckoutSectionChip>
      </div>

      {/* حقول الاسم والبلد والعنوان والمحافظة والمنطقة */}
      <div className="mt-4 space-y-4">
        <div className="space-y-3">
          <FormField
            label="الاسم الأول"
            id="contactFirstName"
            name="contactFirstName"
            placeholder="First Name"
            value={values.contactFirstName}
            onChange={(e) => onChange("contactFirstName", e.target.value)}
            error={errors.contactFirstName}
            autoComplete="given-name"
            required
          />
          <FormField
            label="الاسم الثاني"
            id="contactLastName"
            name="contactLastName"
            placeholder="Last Name"
            value={values.contactLastName}
            onChange={(e) => onChange("contactLastName", e.target.value)}
            error={errors.contactLastName}
            autoComplete="family-name"
            required
          />

          <SelectField
            label="البلد"
            id="shippingCountry"
            name="shippingCountry"
            value={values.shippingCountry}
            onChange={(e) => onChange("shippingCountry", e.target.value)}
            error={errors.shippingCountry}
            required
          >
            <option value="EG">مصر (EG)</option>
          </SelectField>

          <FormField
            label="العنوان بالتفصيل"
            id="shippingAddress1"
            name="shippingAddress1"
            placeholder="مثال: 15 شارع النيل، الدور الثالث"
            value={values.shippingAddress1}
            onChange={(e) => onChange("shippingAddress1", e.target.value)}
            error={errors.shippingAddress1}
            autoComplete="street-address"
            required
          />

          <SearchableSelectField
            label="المحافظة"
            id="shippingState"
            name="shippingStateCode"
            value={values.shippingStateCode}
            onValueChange={handleGovernorateChange}
            options={GOVERNORATE_OPTIONS}
            placeholder="حدد خيارًا..."
            helperText="سيتم إرسال اسم المحافظة مع الطلب وكودها للإدارة."
            error={errors.shippingStateCode ?? errors.shippingState}
            required
          />

          <SearchableSelectField
            label="المنطقة (اختياري)"
            id="shippingCity"
            name="shippingCity"
            value={values.shippingCity}
            onValueChange={(next) => onChange("shippingCity", next)}
            options={shippingAreaOptions}
            placeholder={
              values.shippingStateCode
                ? "ابحث أو اختر منطقة..."
                : "اختاري المحافظة أولاً"
            }
            helperText="قائمة بحسب المحافظة؛ يمكن تركها فارغة."
            error={errors.shippingCity}
            disabled={!values.shippingStateCode}
          />

          <FormField
            label="Phone"
            id="contactPhone"
            name="contactPhone"
            inputMode="tel"
            placeholder="Phone"
            value={values.contactPhone}
            onChange={(e) => onChange("contactPhone", e.target.value)}
            error={errors.contactPhone}
            helperText="أرقام فقط (يمكن استخدام الأرقام العربية وسيتم تحويلها تلقائيًا)"
            autoComplete="tel"
            required
          />

          <FormField
            label="رقم تليفون آخر (اختياري)"
            id="contactPhoneAlt"
            name="contactPhoneAlt"
            inputMode="tel"
            value={values.contactPhoneAlt}
            onChange={(e) => onChange("contactPhoneAlt", e.target.value)}
            error={errors.contactPhoneAlt}
            autoComplete="tel"
          />

          <FormField
            label="البريد للتواصل (اختياري)"
            id="contactEmail"
            name="contactEmail"
            type="email"
            placeholder="email@example.com"
            value={values.contactEmail}
            onChange={(e) => onChange("contactEmail", e.target.value)}
            error={errors.contactEmail}
            helperText={
              values.createAccount
                ? "لإنشاء حساب فعلياً: أدخل بريداً صالحاً وكلمة مرور كافية؛ وإلا يُكمَل الطلب كضيف."
                : "لإشعارات الطلب؛ يمكن تركه فارغاً لطلب الضيف."
            }
            autoComplete="email"
          />
        </div>

        {/* خيارات: حساب جديد، عنوان شحن مختلف */}
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={values.createAccount}
              onChange={(e) => onChange("createAccount", e.target.checked)}
              className="size-4 shrink-0 rounded border-border text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            />
            <span className="text-start text-sm text-brand-900">Create an account?</span>
          </label>
          {values.createAccount ? (
            <FormField
              label="كلمة المرور"
              id="accountPassword"
              name="accountPassword"
              type="password"
              autoComplete="new-password"
              value={values.accountPassword}
              onChange={(e) => onChange("accountPassword", e.target.value)}
              error={errors.accountPassword}
              helperText="ثمانية أحرف على الأقل عند إنشاء الحساب."
            />
          ) : null}

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={values.shipToDifferentAddress}
              onChange={(e) => onChange("shipToDifferentAddress", e.target.checked)}
              className="size-4 shrink-0 rounded border-border text-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            />
            <span className="text-start text-sm text-brand-900">
              Ship to a different address?
            </span>
          </label>
        </div>

        {/* مستلم المنزل عند اختيار عنوان شحن مختلف — الاسم فقط؛ العنوان يبقى مشتركاً */}
        {values.shipToDifferentAddress ? (
          <div className="rounded-xl border border-border/60 bg-surface-muted/30 p-3">
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              عنوان التوصيل — اسم المستلم
            </p>
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
                label="الاسم الثاني (مستلم الطلب)"
                id="shippingLastName"
                name="shippingLastName"
                value={values.shippingLastName}
                onChange={(e) => onChange("shippingLastName", e.target.value)}
                error={errors.shippingLastName}
                autoComplete="shipping family-name"
                required
              />
            </div>
          </div>
        ) : null}

        <FieldSep />

        {/* ملاحظات الطلب */}
        <div>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <label
              htmlFor={noteId}
              className="text-start text-xs font-medium text-muted-foreground"
            >
              ملاحظات الطلب (اختياري)
            </label>
            <span className="text-[11px] text-muted-foreground tabular-nums" aria-live="polite">
              {values.customerNote.length}/500
            </span>
          </div>
          <textarea
            id={noteId}
            name="customerNote"
            rows={4}
            maxLength={500}
            placeholder="ملاحظات حول الطلب، مثال: ملحوظة خاصة بتسليم الطلب."
            value={values.customerNote}
            onChange={(e) => onCustomerNoteChange(e.target.value)}
            className={cn(
              inputSurfaceClass({ invalid: invalidNote }),
              "mt-2 min-h-[108px] w-full resize-y text-base leading-relaxed lg:text-sm",
            )}
            aria-invalid={invalidNote}
          />
          {errors.customerNote ? (
            <p className="mt-1 text-start text-xs text-red-600" role="alert">
              {errors.customerNote}
            </p>
          ) : null}
        </div>

        <FieldSep />

        <div className="rounded-xl border border-border/60 bg-surface-muted/40 px-3 py-2.5 text-center text-xs text-muted-foreground">
          الشحن مجاني — لا حاجة لاختيار طريقة توصيل إضافية.
        </div>
      </div>
    </Card>
  );
}
