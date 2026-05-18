"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { CheckoutCouponRow } from "@/features/checkout/components/checkout-coupon-row";
import { CheckoutFooterMeta } from "@/features/checkout/components/checkout-footer-meta";
import { CheckoutLegalNote } from "@/features/checkout/components/checkout-legal-note";
import { CheckoutEmptyCart } from "@/features/checkout/components/checkout-empty-cart";
import { CheckoutFormErrorBanner } from "@/features/checkout/components/checkout-form-error-banner";
import { CheckoutLoadingOverlay } from "@/features/checkout/components/checkout-loading-overlay";
import { CheckoutSessionBanner } from "@/features/checkout/components/checkout-session-banner";
import { CheckoutMobileSubmitDock } from "@/features/checkout/components/checkout-mobile-submit-dock";
import { CheckoutPaymentForm } from "@/features/checkout/components/CheckoutPaymentForm";
import { CheckoutReassuranceNote } from "@/features/checkout/components/checkout-reassurance-note";
import { CheckoutShippingForm } from "@/features/checkout/components/CheckoutShippingForm";
import { CheckoutSummary } from "@/features/checkout/components/CheckoutSummary";
import { CheckoutStepCard } from "@/features/checkout/components/checkout-step-card";
import { CheckoutSupportFooter } from "@/features/checkout/components/checkout-support-footer";
import { CheckoutTrustStrip } from "@/features/checkout/components/checkout-trust-strip";
import { useCheckoutForm } from "@/features/checkout/hooks/useCheckoutForm";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

/*
 * نموذج إتمام الطلب: على الجوال عمود واحد — بطاقات خطوات (عميل → عنوان → دفع → مراجعة) ثم dock الإرسال.
 * من lg: صف أفقي — عمود النموذج مرقّم، عمود الملخص sticky يميناً.
 * بعد نجاح الطلب: تُحفظ لقطة الطلب مؤقتاً ثم ينتقل العميل إلى صفحة `/order-confirmation`.
 * الشحن مجاني؛ ملاحظات الطلب داخل كتلة «بيانات الدفع»؛ مسودة الحقول في localStorage.
 * تحسينات الموبايل: ملخص قابل للطي، dock ثابت للإجمالي والتأكيد، وشريط ضمانات قبل الإرسال.
 */
export function CheckoutForm() {
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const [mobileDockVisible, setMobileDockVisible] = useState(true);
  const {
    values,
    errors,
    items,
    totalPrice,
    shippingFee,
    orderTotal,
    shippingMethodTitle,
    appliedCoupon,
    cartEmpty,
    isSubmitting,
    loadingOverlayVisible,
    onlinePaymentSelected,
    update,
    updatePaymentMethod,
    applyCoupon,
    removeCoupon,
    submitOrder,
  } = useCheckoutForm();

  useEffect(() => {
    const button = submitButtonRef.current;
    if (!button) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setMobileDockVisible(!entry.isIntersecting);
      },
      { threshold: 0.25 },
    );

    observer.observe(button);
    return () => observer.disconnect();
  }, []);

  const summaryInner = (
    <>
      <CheckoutSummary
        items={items}
        subtotal={totalPrice}
        total={orderTotal}
        shippingAmount={shippingFee}
        shippingLabel={shippingMethodTitle}
        className="max-lg:border-0 max-lg:bg-transparent max-lg:p-0 max-lg:shadow-none"
      />
      <CheckoutReassuranceNote />
    </>
  );

  /* عمود الملخص: خطوة «مراجعة» على الجوال؛ بطاقة ملخص لاصقة على lg */
  const summaryColumn = (
    <div className="order-2 flex flex-col gap-3 lg:order-2 lg:max-w-md lg:shrink-0 lg:sticky lg:top-6 lg:p-0">
      <CheckoutStepCard
        step={4}
        title="مراجعة الطلب"
        subtitle="تأكد من المنتجات والإجمالي قبل الإرسال"
        className="lg:hidden"
      >
        {summaryInner}
      </CheckoutStepCard>
      <div
        className={cn(
          surfacePanelClass,
          "hidden lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-3 lg:p-4",
        )}
      >
        {summaryInner}
      </div>
    </div>
  );

  if (cartEmpty) {
    return (
      <div className="mx-auto max-w-lg pb-10">
        <CheckoutEmptyCart />
      </div>
    );
  }

  /* عمود الحقول: خطوات 1–2 ثم الشحن والدفع ثم الضمانات والإرسال */
  const formColumn = (
    <div className="order-1 flex min-w-0 flex-1 flex-col gap-3 lg:order-1">
      <CheckoutSessionBanner values={values} />
      <CheckoutFormErrorBanner errors={errors} />
      <CheckoutShippingForm
        values={values}
        errors={errors}
        onChange={update}
        onCustomerNoteChange={(v) => update("customerNote", v)}
      />
      <CheckoutStepCard
        step={3}
        title="الشحن والدفع"
        subtitle="طريقة الدفع وكوبون الخصم"
      >
        <div className="space-y-4">
          <CheckoutPaymentForm
            values={values}
            errors={errors}
            onPaymentMethodChange={updatePaymentMethod}
            embedded
          />
          <CheckoutCouponRow
            appliedCoupon={appliedCoupon}
            onApply={applyCoupon}
            onRemove={removeCoupon}
          />
        </div>
      </CheckoutStepCard>
      <CheckoutLegalNote />
      <CheckoutTrustStrip />
      <Button
        ref={submitButtonRef}
        type="button"
        loading={isSubmitting}
        disabled={cartEmpty || isSubmitting}
        size="lg"
        className="h-14 font-bold shadow-[0_14px_34px_-18px_rgba(218,255,0,0.85)]"
        onClick={() => void submitOrder()}
      >
        {isSubmitting
          ? onlinePaymentSelected
            ? "جاري تجهيز صفحة الدفع…"
            : "جاري تأكيد الطلب…"
          : "تأكيد الطلب والدفع"}
      </Button>
      <CheckoutSupportFooter />
      <CheckoutFooterMeta />
    </div>
  );

  return (
    <>
      <CheckoutLoadingOverlay
        visible={loadingOverlayVisible}
        onlinePayment={onlinePaymentSelected}
      />
      {/* حاوية مركزية: ضيقة على الجوال/تابلت، تتسع وتتحول لصف من عمودين من lg */}
      <div
        className="mx-auto flex min-w-0 max-w-none flex-col gap-3 pb-32 sm:max-w-xl md:max-w-2xl lg:max-w-6xl lg:flex-row lg:items-start lg:gap-10 lg:pb-10"
        role="group"
        aria-label="إتمام الطلب"
      >
        {summaryColumn}
        {formColumn}
      </div>
      <CheckoutMobileSubmitDock
        total={orderTotal}
        itemCount={items.length}
        visible={mobileDockVisible}
        disabled={cartEmpty || isSubmitting}
        loading={isSubmitting}
        onSubmit={() => void submitOrder()}
      />
    </>
  );
}
