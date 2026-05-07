"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import {
  emitWooCacheInvalidationFromData,
  invalidateStorefrontQueriesFromWooEvent,
  restoreStorefrontQueryCache,
  subscribeStorefrontQueryCachePersistence,
  WOO_CACHE_INVALIDATION_EVENT,
  type WooCacheInvalidationPayload,
} from "@/lib/storefront-offline-cache";
import { scheduleIdleCallback } from "@/lib/schedule-idle-callback";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  /**
   * استعادة ‎`localStorage`‎ بعد أول commit وليس في ‎`useState`‎:
   * ‎`HydrationBoundary`‎ يدمج بيانات RSC في أول render فقط للاستعلامات «الجديدة» في الكاش.
   * إذا مُلئ الكاش من ‎`restoreStorefrontQueryCache`‎ قبل ذلك، يُؤجَّل الـ hydrate إلى ‎`useEffect`‎
   * في ‎`HydrationBoundary`‎ → ‎`useQuery`‎ يبقى ‎`pending`‎ لإطار أو أكثر وتظهر شبكات الـ skeleton على الهوم.
   */
  useEffect(
    () =>
      scheduleIdleCallback(() => restoreStorefrontQueryCache(queryClient), {
        timeout: 1800,
      }),
    [queryClient],
  );

  useEffect(() => {
    return subscribeStorefrontQueryCachePersistence(queryClient);
  }, [queryClient]);

  useEffect(() => {
    const onWooInvalidation = (event: Event) => {
      const custom = event as CustomEvent<WooCacheInvalidationPayload>;
      invalidateStorefrontQueriesFromWooEvent(queryClient, custom.detail ?? {});
    };

    const onServiceWorkerMessage = (event: MessageEvent) => {
      const data =
        event.data && typeof event.data === "object"
          ? (event.data as Record<string, unknown>)
          : undefined;
      emitWooCacheInvalidationFromData(data);
    };

    window.addEventListener(WOO_CACHE_INVALIDATION_EVENT, onWooInvalidation);
    navigator.serviceWorker?.addEventListener("message", onServiceWorkerMessage);

    return () => {
      window.removeEventListener(WOO_CACHE_INVALIDATION_EVENT, onWooInvalidation);
      navigator.serviceWorker?.removeEventListener(
        "message",
        onServiceWorkerMessage,
      );
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}
