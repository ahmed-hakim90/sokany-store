"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import {
  emitWooCacheInvalidationFromData,
  invalidateStorefrontQueriesFromWooEvent,
  isPersistableStorefrontQueryKey,
  restoreStorefrontQueryCache,
  subscribeStorefrontQueryCachePersistence,
  WOO_CACHE_INVALIDATION_EVENT,
  type WooCacheInvalidationPayload,
} from "@/lib/storefront-offline-cache";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      });
      restoreStorefrontQueryCache(client);
      return client;
    },
  );

  useEffect(() => {
    return subscribeStorefrontQueryCachePersistence(queryClient);
  }, [queryClient]);

  useEffect(() => {
    const refetchPersistedStorefrontQueries = () => {
      void queryClient.invalidateQueries({
        predicate: (query) => isPersistableStorefrontQueryKey(query.queryKey),
        refetchType: "active",
      });
    };

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

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refetchPersistedStorefrontQueries();
      }
    };

    window.addEventListener(WOO_CACHE_INVALIDATION_EVENT, onWooInvalidation);
    window.addEventListener("online", refetchPersistedStorefrontQueries);
    window.addEventListener("focus", refetchPersistedStorefrontQueries);
    document.addEventListener("visibilitychange", onVisible);
    navigator.serviceWorker?.addEventListener("message", onServiceWorkerMessage);

    return () => {
      window.removeEventListener(WOO_CACHE_INVALIDATION_EVENT, onWooInvalidation);
      window.removeEventListener("online", refetchPersistedStorefrontQueries);
      window.removeEventListener("focus", refetchPersistedStorefrontQueries);
      document.removeEventListener("visibilitychange", onVisible);
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
