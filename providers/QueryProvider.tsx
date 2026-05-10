"use client";

/**
 * إعداد TanStack Query للمتجر
 * بالعامية: QueryClient واحد، استعادة كاش من localStorage بعد أول frame (علشان ما يكسرش HydrationBoundary)، اشتراك في حفظ الكاش، وسماع أحداث إبطال من SW أو الداخل.
 *
 * ملاحظات:
 * - `restore` في effect + idle علشان الهوم ما تفضلش skeleton من غير داعي.
 * - شوف كمان: `@/lib/storefront-offline-cache.ts`
 */
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
import { STALE_TIME } from "@/lib/constants";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME.MEDIUM,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
        },
      }),
  );

  /* استعادة localStorage بعد أول commit: لو حصلت في useState الأول ممكن تخلي HydrationBoundary/useQuery يتأخروا ويطلع skeleton على الهوم. */
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
