"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Link } from "next-view-transitions";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { CheckoutOtpModal } from "@/features/checkout/components/checkout-otp-modal";
import { useFirebasePhoneOtp } from "@/features/auth/hooks/useFirebasePhoneOtp";
import { loginWithFirebaseIdToken } from "@/features/auth/services/loginWithFirebase";
import { ROUTES } from "@/lib/constants";
import { normalizeEgyptPhoneToE164 } from "@/lib/phone";

const LOGIN_RECAPTCHA_ID = "login-recaptcha";

/*
 * صفحة تسجيل الدخول برقم الموبايل (/login): نموذج بسيط داخل Container؛ على sm يتمركز بعرض أقصى؛
 * بعد إدخال الرقم يُفتح مودال OTP (reCAPTCHA + SMS) ثم تبادل رمز Firebase ID مع `/api/auth/firebase` لإصدار JWT المتجر.
 */

export function LoginPageContent() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpSessionKey, setOtpSessionKey] = useState(0);
  const [otpPhoneE164, setOtpPhoneE164] = useState<string | null>(null);
  const otpSendStartedRef = useRef(false);

  const {
    error,
    isSending,
    isVerifying,
    sendOtp,
    confirmOtpCode,
    reset: resetPhoneOtp,
  } = useFirebasePhoneOtp(LOGIN_RECAPTCHA_ID);

  const phoneHint = (normalizeEgyptPhoneToE164(phone) ?? phone.trim()) || "—";

  const startOtpSms = useCallback(async () => {
    if (otpSendStartedRef.current || !otpPhoneE164) return;
    otpSendStartedRef.current = true;
    try {
      await sendOtp(otpPhoneE164);
    } catch (e) {
      otpSendStartedRef.current = false;
      toast.error(e instanceof Error ? e.message : "تعذر إرسال رمز التحقق.");
    }
  }, [sendOtp, otpPhoneE164]);

  const openOtpFlow = useCallback(() => {
    const e164 = normalizeEgyptPhoneToE164(phone);
    if (!e164) {
      toast.error("أدخل رقم موبايل مصري صالحاً.");
      return;
    }
    otpSendStartedRef.current = false;
    setOtpPhoneE164(e164);
    setOtpSessionKey((k) => k + 1);
    setOtpModalOpen(true);
  }, [phone]);

  const dismissOtpModal = useCallback(() => {
    setOtpModalOpen(false);
    setOtpPhoneE164(null);
    otpSendStartedRef.current = false;
    resetPhoneOtp();
  }, [resetPhoneOtp]);

  const onSubmitCode = useCallback(
    async (code: string) => {
      try {
        const user = await confirmOtpCode(code);
        const idToken = await user.getIdToken(true);
        await loginWithFirebaseIdToken(idToken);
        dismissOtpModal();
        toast.success("تم تسجيل الدخول.");
        router.push(ROUTES.MY_ORDERS);
        router.refresh();
      } catch {
        /* أخطاء التحقق في الـ hook / الـ modal */
      }
    },
    [confirmOtpCode, dismissOtpModal, router],
  );

  return (
    <>
      <CheckoutOtpModal
        recaptchaContainerId={LOGIN_RECAPTCHA_ID}
        key={otpSessionKey}
        open={otpModalOpen}
        otpSessionKey={otpSessionKey}
        phoneHint={phoneHint}
        phoneE164={otpPhoneE164}
        isSending={isSending}
        error={error}
        isVerifying={isVerifying}
        onClose={dismissOtpModal}
        onMountSendSms={startOtpSms}
        onSubmitCode={(code) => void onSubmitCode(code)}
      />
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-md space-y-6">
          <div>
            <h1 className="font-display text-xl font-semibold text-brand-950 sm:text-2xl md:text-3xl">
              تسجيل الدخول
            </h1>
            <p className="mt-2 text-sm text-brand-900/70">
              أدخل رقم الموبايل المسجّل لدينا؛ سنرسل رمز تحقق عبر SMS لربط حسابك وعرض طلباتك.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
            <label htmlFor="login-phone" className="block text-sm font-medium text-brand-950">
              رقم الموبايل
            </label>
            <input
              id="login-phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01xxxxxxxxx"
              className="h-12 w-full rounded-lg border border-border bg-surface-muted px-4 text-base text-foreground outline-none ring-brand-500/30 focus:border-brand-500 focus:ring-2"
            />
            <Button
              type="button"
              size="lg"
              className="h-12 w-full font-bold"
              loading={isSending && !otpModalOpen}
              onClick={() => void openOtpFlow()}
            >
              متابعة برمز SMS
            </Button>
          </div>

          <p className="text-center text-sm text-brand-900/60">
            <Link href={ROUTES.HOME} className="font-semibold text-brand-800 underline-offset-4 hover:underline">
              العودة للرئيسية
            </Link>
          </p>
        </div>
      </Container>
    </>
  );
}
