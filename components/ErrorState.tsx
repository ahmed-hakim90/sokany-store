"use client";

import { StorefrontDataError } from "@/components/StorefrontDataError";

/** غلاف يحافظ على ‎`message`‎/‎`onRetry`‎ — واجهة عربية موحّدة عبر ‎`StorefrontDataError`‎. */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <StorefrontDataError
      onRetry={onRetry}
      detailMessage={message}
    />
  );
}
