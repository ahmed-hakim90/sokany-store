"use client";

import { useCallback, useRef, useState } from "react";
import {
  type ConfirmationResult,
  type User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { mapFirebaseAuthLikeError } from "@/lib/firebase-auth-errors";

function clearRecaptchaMountElement(containerId: string): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById(containerId);
  if (el) {
    el.replaceChildren();
  }
}

export type UseFirebasePhoneOtpResult = {
  error: string | null;
  isSending: boolean;
  isVerifying: boolean;
  sendOtp: (phoneE164: string) => Promise<void>;
  /** Confirms the SMS code and returns the signed-in Firebase user. */
  confirmOtpCode: (otpCode: string) => Promise<User>;
  reset: () => void;
};

export function useFirebasePhoneOtp(recaptchaContainerId: string): UseFirebasePhoneOtpResult {
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const lastPhoneE164Ref = useRef<string | null>(null);

  const reset = useCallback(() => {
    setError(null);
    confirmationRef.current = null;
    lastPhoneE164Ref.current = null;
    try {
      verifierRef.current?.clear();
    } catch {
      /* ignore */
    }
    verifierRef.current = null;
    clearRecaptchaMountElement(recaptchaContainerId);
  }, [recaptchaContainerId]);

  const sendOtp = useCallback(
    async (phoneE164: string) => {
      setError(null);
      setIsSending(true);
      lastPhoneE164Ref.current = phoneE164;
      try {
        const auth = getFirebaseAuth();
        try {
          verifierRef.current?.clear();
        } catch {
          /* ignore */
        }
        verifierRef.current = null;
        clearRecaptchaMountElement(recaptchaContainerId);
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });

        verifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerId, {
          size: "compact",
        });
        confirmationRef.current = await signInWithPhoneNumber(
          auth,
          phoneE164,
          verifierRef.current,
        );
      } catch (e) {
        const msg = mapFirebaseAuthLikeError(e);
        setError(msg);
        try {
          verifierRef.current?.clear();
        } catch {
          /* ignore */
        }
        verifierRef.current = null;
        clearRecaptchaMountElement(recaptchaContainerId);
        confirmationRef.current = null;
        throw new Error(msg, { cause: e });
      } finally {
        setIsSending(false);
      }
    },
    [recaptchaContainerId],
  );

  const confirmOtpCode = useCallback(
    async (otpCode: string) => {
      setError(null);
      const trimmed = otpCode.replace(/\s/g, "");
      if (trimmed.length < 4) {
        const msg = "أدخل رمز التحقق كاملاً.";
        setError(msg);
        throw new Error(msg);
      }

      const confirmation = confirmationRef.current;
      if (!confirmation) {
        const msg = "انتهت جلسة التحقق. أغلق النافذة وأعد المحاولة.";
        setError(msg);
        throw new Error(msg);
      }

      setIsVerifying(true);
      try {
        const credential = await confirmation.confirm(trimmed);
        const { user } = credential;

        confirmationRef.current = null;
        try {
          verifierRef.current?.clear();
        } catch {
          /* ignore */
        }
        verifierRef.current = null;
        clearRecaptchaMountElement(recaptchaContainerId);

        return user;
      } catch (e) {
        const msg = mapFirebaseAuthLikeError(e);
        setError(msg);
        throw new Error(msg, { cause: e });
      } finally {
        setIsVerifying(false);
      }
    },
    [recaptchaContainerId],
  );

  return {
    error,
    isSending,
    isVerifying,
    sendOtp,
    confirmOtpCode,
    reset,
  };
}
