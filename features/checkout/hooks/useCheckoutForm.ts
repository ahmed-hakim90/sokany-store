"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
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
  contactFirstName: "",
  contactLastName: "",
  contactEmail: "",
  contactPhone: "",
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

export function useCheckoutForm() {
  const [values, setValues] = useState<CheckoutFormData>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);

  const dismissOrderSuccess = useCallback(() => {
    setOrderSuccessOpen(false);
  }, []);
  const { items, totalPrice, clearCart } = useCart();
  const checkoutOrder = useCheckoutOrderMutation();

  const shippingFee = shippingFeeForMethod(values.shippingMethod);
  const orderTotal = totalPrice + shippingFee;
  const shippingMethodTitle = useMemo(() => shippingMethodTitleFor(values), [values]);
  const cartEmpty = items.length === 0;

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
          setOrderSuccessOpen(true);
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

  return {
    values,
    errors,
    items,
    totalPrice,
    shippingFee,
    orderTotal,
    shippingMethodTitle,
    cartEmpty,
    isSubmitting: checkoutOrder.isPending,
    orderSuccessOpen,
    dismissOrderSuccess,
    update,
    updateShippingMethod,
    updatePaymentMethod,
    submitOrder,
  };
}
