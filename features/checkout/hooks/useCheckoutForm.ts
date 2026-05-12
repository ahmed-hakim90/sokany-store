"use client";

import { useCallback, useEffect, useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
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
import { saveOrderConfirmationSession } from "@/features/checkout/lib/order-confirmation-session";
import { addGuestOrderRef } from "@/features/orders/lib/local-guest-orders-storage";
import { defaultCheckoutFormValues } from "@/features/checkout/lib/checkout-form-defaults";
import {
  CHECKOUT_SHIPPING_DISPLAY_LABEL,
  shippingFeeForMethod,
} from "@/features/checkout/lib/to-create-order-payload";
import { ROUTES } from "@/lib/constants";
import type {
  CheckoutFormData,
  CheckoutSuccessSnapshot,
} from "@/features/checkout/types";
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
  const router = useTransitionRouter();
  const [values, setValues] = useState<CheckoutFormData>(defaultCheckoutFormValues);
  const [rehydratedDraft, setRehydratedDraft] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
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

  const applyCoupon = useCallback((code: string) => {
    const normalized = code.trim();
    if (!normalized) {
      toast.message("أدخل رمز الكوبون");
      return;
    }
    setAppliedCoupon(normalized);
    toast.success("تم حفظ الكوبون وسيُطبق عند تأكيد الطلب.");
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    toast.message("تمت إزالة الكوبون.");
  }, []);

  const runOrderMutation = useCallback(
    (firebaseUid?: string) => {
      checkoutOrder.mutate(
        { values, items, couponCode: appliedCoupon ?? undefined, firebaseUid },
        {
          onSuccess: (order) => {
            const recipientFirstName = values.shipToDifferentAddress
              ? values.shippingFirstName
              : values.contactFirstName;
            const recipientLastName = values.shipToDifferentAddress
              ? values.shippingLastName
              : values.contactLastName;
            const snapshot: CheckoutSuccessSnapshot = {
              items: items.map((item) => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                thumbnail: item.thumbnail,
                sku: item.sku,
              })),
              subtotal: totalPrice,
              shippingFee,
              total: orderTotal,
              shippingMethodTitle,
              paymentMethod: values.paymentMethod,
              shipping: {
                name: `${recipientFirstName} ${recipientLastName}`.trim(),
                phone: values.contactPhone,
                phoneAlt: values.contactPhoneAlt,
                email: values.contactEmail,
                address1: values.shippingAddress1,
                address2: values.shippingAddress2,
                city: values.shippingCity,
                state: values.shippingState,
                postcode: values.shippingPostcode,
              },
            };

            saveOrderConfirmationSession({ order, snapshot });
            clearCart();
            if (order.orderKey.trim()) {
              addGuestOrderRef({ id: order.id, orderKey: order.orderKey });
            }
            clearCheckoutDraftFromStorage();
            setValues(defaultCheckoutFormValues);
            setErrors({});
            setAppliedCoupon(null);
            router.push(
              `${ROUTES.ORDER_CONFIRMATION}?id=${encodeURIComponent(String(order.id))}`,
            );
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
    [appliedCoupon, checkoutOrder, clearCart, items, orderTotal, router, shippingFee, shippingMethodTitle, totalPrice, values],
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
    appliedCoupon,
    cartEmpty,
    isSubmitting: checkoutOrder.isPending,
    loadingOverlayVisible: checkoutOrder.isPending,
    update,
    updatePaymentMethod,
    applyCoupon,
    removeCoupon,
    submitOrder,
  };
}
