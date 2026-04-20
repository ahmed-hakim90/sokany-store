"use client";

import { Button } from "@/components/Button";
import { CheckoutCouponRow } from "@/features/checkout/components/checkout-coupon-row";
import { CheckoutFooterMeta } from "@/features/checkout/components/checkout-footer-meta";
import { CheckoutLegalNote } from "@/features/checkout/components/checkout-legal-note";
import { CheckoutLoadingOverlay } from "@/features/checkout/components/checkout-loading-overlay";
import { CheckoutPaymentForm } from "@/features/checkout/components/CheckoutPaymentForm";
import { CheckoutReassuranceNote } from "@/features/checkout/components/checkout-reassurance-note";
import { CheckoutShippingForm } from "@/features/checkout/components/CheckoutShippingForm";
import { CheckoutSummary } from "@/features/checkout/components/CheckoutSummary";
import { OrderSuccessCelebration } from "@/features/checkout/components/order-success-celebration";
import { CheckoutSupportFooter } from "@/features/checkout/components/checkout-support-footer";
import { CheckoutRegister } from "@/features/checkout/components/checkout-register";
import { useCheckoutForm } from "@/features/checkout/hooks/useCheckoutForm";

/*
 * نموذج إتمام الطلب: على الجوال عمود واحد — الملخص أولاً (order-1) ثم حقول الشحن والدفع (order-2).
 * من lg: صف أفقي بعرض أقصى أوسع — عمود النموذج يتمدد، عمود الملخص max-width مع sticky عند التمرير.
 * بعد نجاح الطلب: `OrderSuccessCelebration` (شكر + قلوب) فوق الطبقة z-[200].
 */
export function CheckoutForm() {
  const {
    values,
    errors,
    items,
    totalPrice,
    shippingFee,
    orderTotal,
    shippingMethodTitle,
    cartEmpty,
    isSubmitting,
    orderSuccessOpen,
    dismissOrderSuccess,
    update,
    updateShippingMethod,
    updatePaymentMethod,
    setCreateAccount,
    submitOrder,
  } = useCheckoutForm();

  /* عمود الملخص: يتقدم بصرياً على الجوال؛ يلتصق أعلى الشاشة على الشاشات العريضة أثناء التمرير */
  const summaryColumn = (
    <div className="order-1 flex flex-col gap-3 p-3 lg:order-2 lg:max-w-md lg:shrink-0 lg:sticky lg:top-6">
      <CheckoutSummary
        items={items}
        subtotal={totalPrice}
        total={orderTotal}
        shippingAmount={shippingFee}
        shippingLabel={shippingMethodTitle}
      />
      <CheckoutReassuranceNote />
    </div>
  );

  /* عمود الحقول: شحن ثم دفع ثم ملاحظات قانونية وأزرار ودعم */
  const formColumn = (
    <div className="order-2 flex min-w-0 flex-1 flex-col gap-3 lg:order-1">
      <CheckoutShippingForm
        values={values}
        errors={errors}
        onChange={update}
        onShippingMethodChange={updateShippingMethod}
      />
      <CheckoutPaymentForm
        values={values}
        errors={errors}
        onPaymentMethodChange={updatePaymentMethod}
        onCustomerNoteChange={(v) => update("customerNote", v)}
      />
      <CheckoutRegister
        values={values}
        errors={errors}
        onCreateAccountChange={setCreateAccount}
        onPasswordChange={(v) => update("accountPassword", v)}
      />
      <CheckoutCouponRow />
      <CheckoutLegalNote />
      <Button
        type="button"
        loading={isSubmitting}
        disabled={cartEmpty}
        size="lg"
        className="h-14 base font-bold shadow-[0_14px_34px_-18px_rgba(218,255,0,0.85)]"
        onClick={() => void submitOrder()}
      >
        تأكيد الطلب والدفع
      </Button>
      <CheckoutSupportFooter />
      <CheckoutFooterMeta />
    </div>
  );

  return (
    <>
      <OrderSuccessCelebration open={orderSuccessOpen} onDismiss={dismissOrderSuccess} />
      <CheckoutLoadingOverlay visible={isSubmitting} />
      {/* حاوية مركزية: ضيقة على الجوال/تابلت، تتسع وتتحول لصف من عمودين من lg */}
      <div
        className="mx-auto flex min-w-0 max-w-none flex-col gap-3 pb-10 sm:max-w-xl md:max-w-2xl lg:max-w-6xl lg:flex-row lg:items-start lg:gap-10"
        role="group"
        aria-label="إتمام الطلب"
      >
        {summaryColumn}
        {formColumn}
      </div>
    </>
  );
}
