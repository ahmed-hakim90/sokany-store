"use client";

import { useCallback } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useFirebasePhoneOtp } from "@/features/auth/hooks/useFirebasePhoneOtp";
import { STOREFRONT_CUSTOMERS_COLLECTION } from "@/features/checkout/lib/firestore-collections";
import type { CheckoutFormData } from "@/features/checkout/types";
import { getFirebaseFirestore } from "@/lib/firebase";
import { firestoreCustomerSchema } from "@/schemas/firebase-customer";

const RECAPTCHA_CONTAINER_ID = "checkout-recaptcha";

export type UseCustomerAuthResult = {
  error: string | null;
  isSending: boolean;
  isVerifying: boolean;
  sendOtp: (phoneE164: string) => Promise<void>;
  verifyOtpAndSaveCustomer: (
    values: CheckoutFormData,
    otpCode: string,
  ) => Promise<string>;
  reset: () => void;
};

function buildCustomerDoc(values: CheckoutFormData, phoneE164: string, authPhone: string | null) {
  return firestoreCustomerSchema.omit({ updatedAt: true }).parse({
    contactFirstName: values.contactFirstName,
    contactLastName: values.contactLastName,
    contactEmail: values.contactEmail,
    contactPhone: values.contactPhone,
    shippingFirstName: values.shippingFirstName,
    shippingLastName: values.shippingLastName,
    shippingAddress1: values.shippingAddress1,
    shippingAddress2: values.shippingAddress2,
    shippingCity: values.shippingCity,
    shippingState: values.shippingState,
    shippingStateCode: values.shippingStateCode,
    shippingPostcode: values.shippingPostcode,
    shippingCountry: values.shippingCountry,
    shippingMethod: values.shippingMethod,
    paymentMethod: values.paymentMethod,
    phoneE164,
    authPhone: authPhone ?? undefined,
  });
}

export function useCustomerAuth(): UseCustomerAuthResult {
  const {
    error,
    isSending,
    isVerifying,
    sendOtp,
    confirmOtpCode,
    reset,
  } = useFirebasePhoneOtp(RECAPTCHA_CONTAINER_ID);

  const verifyOtpAndSaveCustomer = useCallback(
    async (values: CheckoutFormData, otpCode: string) => {
      const user = await confirmOtpCode(otpCode);
      const phoneE164 = user.phoneNumber ?? values.contactPhone;
      const data = buildCustomerDoc(values, phoneE164, user.phoneNumber);

      const db = getFirebaseFirestore();
      await setDoc(
        doc(db, STOREFRONT_CUSTOMERS_COLLECTION, user.uid),
        {
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      return user.uid;
    },
    [confirmOtpCode],
  );

  return {
    error,
    isSending,
    isVerifying,
    sendOtp,
    verifyOtpAndSaveCustomer,
    reset,
  };
}
