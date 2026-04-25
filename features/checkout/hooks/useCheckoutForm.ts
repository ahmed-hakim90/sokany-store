"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ZodError } from "zod";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { checkoutSchema } from "@/features/checkout/schema";
import {
  CheckoutOrderMutationError,
  useCheckoutOrderMutation,
} from "@/features/checkout/hooks/useCheckoutOrderMutation";
import { useCustomerAuth } from "@/features/checkout/hooks/useCustomerAuth";
import {
  clearCheckoutDraftFromStorage,
  loadCheckoutDraftFromStorage,
  saveCheckoutDraftToStorage,
} from "@/features/checkout/lib/checkout-draft-storage";
import { defaultCheckoutFormValues } from "@/features/checkout/lib/checkout-form-defaults";
import {
  CHECKOUT_SHIPPING_DISPLAY_LABEL,
  shippingFeeForMethod,
} from "@/features/checkout/lib/to-create-order-payload";
import type { CheckoutFormData } from "@/features/checkout/types";
import { normalizeEgyptPhoneToE164 } from "@/lib/phone";

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
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  /** Bumps when a new SMS session starts so `CheckoutOtpModal` remounts with a clean code field. */
  const [otpSessionKey, setOtpSessionKey] = useState(0);
  /** E.164 set when opening the OTP step — SMS is sent after the modal mounts (reCAPTCHA lives in the modal). */
  const [otpPhoneE164, setOtpPhoneE164] = useState<string | null>(null);
  const otpSendStartedRef = useRef(false);

  const dismissOrderSuccess = useCallback(() => {
    setOrderSuccessOpen(false);
  }, []);
  const { items, totalPrice, clearCart } = useCart();
  const checkoutOrder = useCheckoutOrderMutation();

  useEffect(() => {
    const draft = loadCheckoutDraftFromStorage();
    if (draft) {
      setValues(draft);
    }
    setRehydratedDraft(true);
  }, []);

  useEffect(() => {
    if (!rehydratedDraft) return;
    const t = window.setTimeout(() => {
      saveCheckoutDraftToStorage(values);
    }, 300);
    return () => window.clearTimeout(t);
  }, [values, rehydratedDraft]);
  const {
    reset: resetCustomerAuth,
    sendOtp,
    verifyOtpAndSaveCustomer,
    isSending: authSending,
    isVerifying: authVerifying,
    error: authError,
  } = useCustomerAuth();

  const shippingFee = shippingFeeForMethod(values.shippingMethod);
  const orderTotal = totalPrice + shippingFee;
  const shippingMethodTitle = CHECKOUT_SHIPPING_DISPLAY_LABEL;
  const cartEmpty = items.length === 0;

  const update = (key: keyof CheckoutFormData, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const updatePaymentMethod = (value: CheckoutFormData["paymentMethod"]) => {
    setValues((prev) => ({ ...prev, paymentMethod: value }));
  };

  const runOrderMutation = useCallback(
    (firebaseUid?: string) => {
      checkoutOrder.mutate(
        { values, items, firebaseUid },
        {
          onSuccess: () => {
            clearCart();
            setOrderSuccessOpen(true);
            clearCheckoutDraftFromStorage();
            setValues(defaultCheckoutFormValues);
            setErrors({});
            setOtpModalOpen(false);
            resetCustomerAuth();
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
    [checkoutOrder, clearCart, resetCustomerAuth, items, values],
  );

  const submitOrder = useCallback(() => {
    setErrors({});
    const checkoutParsed = checkoutSchema.safeParse(values);
    if (!checkoutParsed.success) {
      setErrors(checkoutFieldErrorsFromSchema(checkoutParsed.error));
      toast.error("يرجى تصحيح الحقول المظللة.");
      return;
    }

    const data = checkoutParsed.data;
    /* طلب ضيف بدون «إنشاء حساب» يُرسل مباشرة — OTP+Firebase فقط لمسار ربط الحساب. */
    if (!data.createAccount) {
      runOrderMutation();
      return;
    }

    const e164 = normalizeEgyptPhoneToE164(data.contactPhone);
    if (!e164) {
      /* يفترض أن checkoutSchema يمنع هذا؛ احتياط لو تغيّر التطبيع لاحقاً */
      toast.error("رقم الموبايل غير صالح.");
      return;
    }

    otpSendStartedRef.current = false;
    setOtpPhoneE164(e164);
    setOtpSessionKey((k) => k + 1);
    setOtpModalOpen(true);
  }, [values, runOrderMutation]);

  const startOtpSms = useCallback(async () => {
    if (otpSendStartedRef.current || !otpPhoneE164) return;
    otpSendStartedRef.current = true;
    try {
      await sendOtp(otpPhoneE164);
    } catch (e) {
      otpSendStartedRef.current = false;
      toast.error(
        e instanceof Error ? e.message : "تعذر إرسال رمز التحقق.",
      );
    }
  }, [sendOtp, otpPhoneE164]);

  const confirmOtpAndPlaceOrder = useCallback(
    async (code: string) => {
      try {
        const uid = await verifyOtpAndSaveCustomer(values, code);
        runOrderMutation(uid);
      } catch {
        /* `authError` from `useCustomerAuth` shows in the modal */
      }
    },
    [verifyOtpAndSaveCustomer, runOrderMutation, values],
  );

  const dismissOtpModal = useCallback(() => {
    setOtpModalOpen(false);
    setOtpPhoneE164(null);
    otpSendStartedRef.current = false;
    resetCustomerAuth();
  }, [resetCustomerAuth]);

  const phoneHint =
    normalizeEgyptPhoneToE164(values.contactPhone) ?? values.contactPhone.trim();

  return {
    values,
    errors,
    items,
    totalPrice,
    shippingFee,
    orderTotal,
    shippingMethodTitle,
    cartEmpty,
    isSubmitting:
      checkoutOrder.isPending || authSending || authVerifying,
    /** Full-page checkout overlay — hide while OTP modal is open so it does not cover the dialog. */
    loadingOverlayVisible:
      checkoutOrder.isPending || (authSending && !otpModalOpen),
    orderSuccessOpen,
    dismissOrderSuccess,
    otpModalOpen,
    otpSessionKey,
    otpPhoneE164,
    otpSending: authSending,
    startOtpSms,
    otpError: authError,
    otpIsVerifying: authVerifying,
    phoneHint,
    confirmOtpAndPlaceOrder,
    dismissOtpModal,
    update,
    updatePaymentMethod,
    submitOrder,
  };
}
