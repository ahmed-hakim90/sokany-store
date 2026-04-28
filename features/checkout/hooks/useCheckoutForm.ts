"use client";

import { useCallback, useEffect, useState } from "react";
import type { ZodError } from "zod";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { checkoutSchema } from "@/features/checkout/schema";
import {
  CheckoutOrderMutationError,
  useCheckoutOrderMutation,
} from "@/features/checkout/hooks/useCheckoutOrderMutation";
import {
  readCheckoutAmendSession,
  readCheckoutAmendFormPrefill,
  clearCheckoutAmendFormPrefill,
} from "@/features/checkout/lib/checkout-amend-session";
import {
  clearCheckoutDraftFromStorage,
  loadCheckoutDraftFromStorage,
  saveCheckoutDraftToStorage,
} from "@/features/checkout/lib/checkout-draft-storage";
import { addGuestOrderRef } from "@/features/orders/lib/local-guest-orders-storage";
import { defaultCheckoutFormValues } from "@/features/checkout/lib/checkout-form-defaults";
import {
  CHECKOUT_SHIPPING_DISPLAY_LABEL,
  shippingFeeForMethod,
} from "@/features/checkout/lib/to-create-order-payload";
import type { CheckoutFormData } from "@/features/checkout/types";
function checkoutFieldErrorsFromSchema(
  error: ZodError,
): Partial<Record<keyof CheckoutFormData, string>> {
  const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
  for (const issue of error.issues) {
    const path = issue.path[0];
    if (typeof path === "string") {
      fieldErrors[path as keyof CheckoutFormData] = issue.message;
    }
  }
  return fieldErrors;
}

export function useCheckoutForm() {
  const [values, setValues] = useState<CheckoutFormData>(defaultCheckoutFormValues);
  const [rehydratedDraft, setRehydratedDraft] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);
  const [placedOrderSummary, setPlacedOrderSummary] = useState<{
    id: number;
    orderNumber: string;
    trackingUrl: string;
    orderKey: string;
  } | null>(null);
  const dismissOrderSuccess = useCallback(() => {
    setOrderSuccessOpen(false);
    setPlacedOrderSummary(null);
  }, []);
  const { items, totalPrice, clearCart } = useCart();
  const checkoutOrder = useCheckoutOrderMutation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const amend = readCheckoutAmendSession();
      const amendPrefill = amend ? readCheckoutAmendFormPrefill(amend) : null;
      const draft = loadCheckoutDraftFromStorage();

      /* زيارة الدفع خارج مسار التعديل: إزالة تعبئة/نسخ احتياطي يتيمين حتى لا تُخلط جلسات لاحقاً */
      if (!amend) {
        clearCheckoutAmendFormPrefill();
      }

      /*
       * لا نمسح prefill أثناء ‎amend‎ هنا: React 18 Strict Mode قد يعيد تشغيل التأثير مرتين في التطوير.
       * يُمسح المفتاح عند ‎clearCheckoutAmendSession‎ بعد نجاح التعديل.
       */
      if (amend && amendPrefill) {
        setValues({ ...defaultCheckoutFormValues, ...amendPrefill });
      } else if (amend && draft) {
        setValues(draft);
      } else if (draft) {
        setValues(draft);
      }
      setRehydratedDraft(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!rehydratedDraft) return;
    const t = window.setTimeout(() => {
      saveCheckoutDraftToStorage(values);
    }, 300);
    return () => window.clearTimeout(t);
  }, [values, rehydratedDraft]);

  const shippingFee = shippingFeeForMethod(values.shippingMethod);
  const orderTotal = totalPrice + shippingFee;
  const shippingMethodTitle = CHECKOUT_SHIPPING_DISPLAY_LABEL;
  const cartEmpty = items.length === 0;

  const update = useCallback(<K extends keyof CheckoutFormData>(
    key: K,
    value: CheckoutFormData[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updatePaymentMethod = (value: CheckoutFormData["paymentMethod"]) => {
    setValues((prev) => ({ ...prev, paymentMethod: value }));
  };

  const runOrderMutation = useCallback(
    (firebaseUid?: string) => {
      checkoutOrder.mutate(
        { values, items, firebaseUid },
        {
          onSuccess: (order) => {
            clearCart();
            if (order.orderKey.trim()) {
              addGuestOrderRef({ id: order.id, orderKey: order.orderKey });
            }
            setPlacedOrderSummary({
              id: order.id,
              orderNumber: order.orderNumber,
              trackingUrl: order.trackingUrl,
              orderKey: order.orderKey,
            });
            setOrderSuccessOpen(true);
            clearCheckoutDraftFromStorage();
            setValues(defaultCheckoutFormValues);
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
              } else if (error.kind === "register") {
                toast.error(
                  error.fieldErrors.accountPassword ?? "تعذر إنشاء الحساب.",
                );
              }
              return;
            }
            toast.error(
              error instanceof Error
                ? error.message
                : "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.",
            );
          },
        },
      );
    },
    [checkoutOrder, clearCart, items, values],
  );

  const submitOrder = useCallback(() => {
    setErrors({});
    const checkoutParsed = checkoutSchema.safeParse(values);
    if (!checkoutParsed.success) {
      setErrors(checkoutFieldErrorsFromSchema(checkoutParsed.error));
      toast.error("يرجى تصحيح الحقول المظللة.");
      return;
    }
    runOrderMutation();
  }, [values, runOrderMutation]);

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
    loadingOverlayVisible: checkoutOrder.isPending,
    orderSuccessOpen,
    placedOrderSummary,
    dismissOrderSuccess,
    update,
    updatePaymentMethod,
    submitOrder,
  };
}
