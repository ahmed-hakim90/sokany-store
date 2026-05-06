"use client";

import { useEffect } from "react";
import { StorefrontErrorScreen } from "@/components/StorefrontErrorScreen";

export default function RootError({
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
    <main className="flex min-h-dvh items-center bg-page px-3 py-8 sm:px-4 sm:py-12 lg:px-8">
      <h1 className="sr-only">حصل خطأ مؤقت في الصفحة</h1>
      <div className="mx-auto w-full max-w-5xl">
        <StorefrontErrorScreen
          tone="page"
          title="حصل خطأ مؤقت في الصفحة"
          description="متقلقش، جرّب تحديث الصفحة الآن. لو المشكلة مستمرة، ارجع للرئيسية وافتح الصفحة مرة ثانية."
          onRetry={unstable_retry}
          retryLabel="تحديث الصفحة"
          referenceCode={error.digest}
        />
      </div>
    </main>
  );
}
