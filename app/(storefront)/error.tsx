"use client";

import { useEffect } from "react";
import { StorefrontErrorScreen } from "@/components/StorefrontErrorScreen";

export default function StorefrontError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-8 sm:px-4 sm:py-12 lg:px-8">
      <h1 className="sr-only">حصل خطأ مؤقت في الصفحة</h1>
      <StorefrontErrorScreen
        tone="page"
        title="حصل خطأ مؤقت في الصفحة"
        description="متقلقش، بياناتك وسلتك محفوظة. جرّب تحديث الصفحة، أو ارجع للرئيسية وتابع التسوق بشكل طبيعي."
        onRetry={unstable_retry}
        retryLabel="تحديث الصفحة"
        referenceCode={error.digest}
      />
    </div>
  );
}
