"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { useCart } from "@/hooks/useCart";
import { CheckoutCouponRow } from "@/features/checkout/components/checkout-coupon-row";
import { CheckoutFooterMeta } from "@/features/checkout/components/checkout-footer-meta";
import { CheckoutLegalNote } from "@/features/checkout/components/checkout-legal-note";
import { CheckoutLoadingOverlay } from "@/features/checkout/components/checkout-loading-overlay";
import { CheckoutPaymentForm } from "@/features/checkout/components/CheckoutPaymentForm";
import { CheckoutReassuranceNote } from "@/features/checkout/components/checkout-reassurance-note";
import { CheckoutShippingForm } from "@/features/checkout/components/CheckoutShippingForm";
import { CheckoutSummary } from "@/features/checkout/components/CheckoutSummary";
import { CheckoutSupportFooter } from "@/features/checkout/components/checkout-support-footer";
import {
  CheckoutOrderMutationError,
  useCheckoutOrderMutation,
} from "@/features/checkout/hooks/useCheckoutOrderMutation";
import {
  shippingFeeForMethod,
  shippingMethodTitleFor,
} from "@/features/checkout/lib/to-create-order-payload";
import type { CheckoutFormData } from "@/features/checkout/types";

const initialValues: CheckoutFormData = {
  billingFirstName: "",
  billingLastName: "",
  billingEmail: "",
  billingPhone: "",
  billingAddress1: "",
  billingAddress2: "",
  billingCity: "",
  billingState: "",
  billingPostcode: "",
  billingCountry: "EG",
  shippingFirstName: "",
  shippingLastName: "",
  shippingAddress1: "",
  shippingAddress2: "",
  shippingCity: "",
  shippingState: "",
  shippingPostcode: "",
  shippingCountry: "EG",
  shippingMethod: "flat_rate",
  paymentMethod: "cod",
  customerNote: "",
};

export function CheckoutForm() {
  const [values, setValues] = useState<CheckoutFormData>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const { items, totalPrice, clearCart } = useCart();
  const checkoutOrder = useCheckoutOrderMutation();

  const shippingFee = shippingFeeForMethod(values.shippingMethod);
  const orderTotal = totalPrice + shippingFee;

  const shippingMethodTitle = useMemo(
    () => shippingMethodTitleFor(values),
    [values],
  );

  const update = (key: keyof CheckoutFormData, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const updateShippingMethod = (value: CheckoutFormData["shippingMethod"]) => {
    setValues((prev) => ({ ...prev, shippingMethod: value }));
  };

  const updatePaymentMethod = (value: CheckoutFormData["paymentMethod"]) => {
    setValues((prev) => ({ ...prev, paymentMethod: value }));
  };

  const submitOrder = () => {
    setErrors({});
    checkoutOrder.mutate(
      { values, items },
      {
        onSuccess: () => {
          clearCart();
          toast.success("تم استلام الطلب بنجاح!");
          setValues(initialValues);
          setErrors({});
        },
        onError: (error) => {
          if (CheckoutOrderMutationError.is(error)) {
            setErrors(error.fieldErrors);
            if (error.kind === "empty_cart") {
              toast.error("السلة فارغة.");
            } else if (error.kind === "checkout") {
              toast.error("يرجى تصحيح الحقول المظللة.");
            } else if (error.kind === "payload") {
              toast.error("تعذر التحقق من بيانات الطلب. راجع الحقول أو حاول لاحقاً.");
            }
            return;
          }
          toast.error("حدث خطأ. حاول مرة أخرى.");
        },
      },
    );
  };

  const cartEmpty = items.length === 0;

  return (
    <>
      <CheckoutLoadingOverlay visible={checkoutOrder.isPending} />
      <div
        className="mx-auto flex w-full min-w-0 max-w-lg flex-col gap-3 pb-10 sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
        role="group"
        aria-label="إتمام الطلب"
      >
        <CheckoutSummary
          items={items}
          subtotal={totalPrice}
          total={orderTotal}
          shippingAmount={shippingFee}
          shippingLabel={shippingMethodTitle}
        />
        <CheckoutCouponRow />
        <CheckoutReassuranceNote />
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
        <CheckoutLegalNote />
        <Button
          type="button"
          loading={checkoutOrder.isPending}
          disabled={cartEmpty}
          size="lg"
          className="h-14 w-full rounded-2xl text-base font-bold shadow-[0_14px_34px_-18px_rgba(218,255,0,0.85)]"
          onClick={() => void submitOrder()}
        >
          تأكيد الطلب والدفع
        </Button>
        <CheckoutSupportFooter />
        <CheckoutFooterMeta />
      </div>
    </>
  );
}
