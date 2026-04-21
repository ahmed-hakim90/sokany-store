"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FocusTrap } from "focus-trap-react";
import { Button } from "@/components/Button";

export type CheckoutOtpModalProps = {
  /** reCAPTCHA container `id` — must match the hook (`checkout-recaptcha` vs `login-recaptcha`). */
  recaptchaContainerId?: string;
  open: boolean;
  /** Bumps per SMS session — used to trigger send after mount. */
  otpSessionKey: number;
  phoneHint: string;
  phoneE164: string | null;
  isSending: boolean;
  error: string | null;
  isVerifying: boolean;
  onClose: () => void;
  /** Called once when the modal opens — sends SMS after `#checkout-recaptcha` is in the DOM. */
  onMountSendSms: () => void | Promise<void>;
  onSubmitCode: (code: string) => void | Promise<void>;
};

export function CheckoutOtpModal({
  recaptchaContainerId = "checkout-recaptcha",
  open,
  otpSessionKey,
  phoneHint,
  phoneE164,
  isSending,
  error,
  isVerifying,
  onClose,
  onMountSendSms,
  onSubmitCode,
}: CheckoutOtpModalProps) {
  const titleId = useId();
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!open || !phoneE164) return;
    void onMountSendSms();
  }, [open, phoneE164, otpSessionKey, onMountSendSms]);

  const submit = useCallback(async () => {
    const trimmed = code.replace(/\s/g, "");
    if (trimmed.length < 4) return;
    await onSubmitCode(trimmed);
  }, [code, onSubmitCode]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="otp-backdrop"
          className="fixed inset-0 z-[220] flex items-end justify-center bg-black/55 p-4 sm:items-center"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            key="otp-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <FocusTrap
              focusTrapOptions={{
                allowOutsideClick: true,
                initialFocus: false,
              }}
            >
              <div className="flex flex-col gap-4 p-6">
                <div className="space-y-1">
                  <h2 id={titleId} className="text-lg font-bold text-foreground">
                    تحقق من رقم الموبايل
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    أدخل الرمز المرسل إلى{" "}
                    <span className="font-medium text-foreground" dir="ltr">
                      {phoneHint}
                    </span>
                  </p>
                </div>

                <div className="space-y-2 rounded-lg border border-border/80 bg-surface-muted/50 p-3">
                  <p className="text-center text-xs leading-relaxed text-muted-foreground">
                    للحماية من الإرسال غير المصرّح به، أكمل التحقق أدناه؛ بعدها يُرسل رمز SMS إلى
                    هاتفك.
                  </p>
                  <div
                    id={recaptchaContainerId}
                    className="flex min-h-[78px] w-full items-center justify-center py-1"
                  />
                </div>

                {isSending ? (
                  <p className="text-center text-sm font-medium text-foreground" aria-live="polite">
                    جاري إرسال رمز التحقق…
                  </p>
                ) : null}

                <div>
                  <label htmlFor="checkout-otp-code" className="sr-only">
                    رمز SMS
                  </label>
                  <input
                    id="checkout-otp-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={12}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ""))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void submit();
                    }}
                    className="h-14 w-full rounded-lg border border-border bg-surface-muted px-4 text-center text-2xl font-semibold tracking-[0.35em] text-foreground outline-none ring-brand-500/30 transition focus:border-brand-500 focus:ring-2"
                    dir="ltr"
                    disabled={isVerifying || isSending}
                    placeholder="••••••"
                  />
                  {error ? (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {error}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-between">
                  <Button
                    type="button"
                    variant="dark"
                    size="lg"
                    className="flex-1"
                    loading={isVerifying}
                    disabled={
                      isVerifying ||
                      isSending ||
                      code.replace(/\s/g, "").length < 4
                    }
                    onClick={() => void submit()}
                  >
                    تأكيد الرمز
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    disabled={isVerifying}
                    onClick={() => {
                      setCode("");
                      onClose();
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </FocusTrap>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
