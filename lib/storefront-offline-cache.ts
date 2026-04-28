import {
  dehydrate,
  hydrate,
  type Query,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";

const QUERY_CACHE_STORAGE_KEY = "sokany_storefront_query_cache_v1";
const QUERY_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const PERSIST_DEBOUNCE_MS = 1_000;

export const WOO_CACHE_INVALIDATION_EVENT = "sokany-woo-cache-invalidation";
export const WOO_CACHE_INVALIDATION_MESSAGE_TYPE = "woo-cache-invalidation";

export type WooCacheInvalidationScope =
  | "products"
  | "categories"
  | "orders"
  | "reviews"
  | "all";

export type WooCacheInvalidationPayload = {
  type?: typeof WOO_CACHE_INVALIDATION_MESSAGE_TYPE;
  topic?: string | null;
  resourceId?: number | string | null;
  scope?: WooCacheInvalidationScope | string | null;
};

type PersistedQueryCache = {
  persistedAt: number;
  clientState: unknown;
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function queryRoot(queryKey: QueryKey): string | null {
  const [root] = queryKey;
  return typeof root === "string" ? root : null;
}

export function isPersistableStorefrontQueryKey(queryKey: QueryKey): boolean {
  const root = queryRoot(queryKey);
  return (
    root === "products" ||
    root === "product" ||
    root === "categories" ||
    root === "reviews"
  );
}

function shouldPersistQuery(query: Query): boolean {
  return (
    query.state.status === "success" &&
    query.state.data !== undefined &&
    isPersistableStorefrontQueryKey(query.queryKey)
  );
}

function readPersistedQueryCache(): PersistedQueryCache | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(QUERY_CACHE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedQueryCache>;
    if (
      typeof parsed.persistedAt !== "number" ||
      !Number.isFinite(parsed.persistedAt) ||
      parsed.clientState == null
    ) {
      return null;
    }
    if (Date.now() - parsed.persistedAt > QUERY_CACHE_MAX_AGE_MS) {
      window.localStorage.removeItem(QUERY_CACHE_STORAGE_KEY);
      return null;
    }
    return parsed as PersistedQueryCache;
  } catch {
    return null;
  }
}

export function restoreStorefrontQueryCache(queryClient: QueryClient): void {
  const persisted = readPersistedQueryCache();
  if (!persisted) return;
  try {
    hydrate(queryClient, persisted.clientState);
  } catch {
    if (isBrowser()) {
      window.localStorage.removeItem(QUERY_CACHE_STORAGE_KEY);
    }
  }
}

export function subscribeStorefrontQueryCachePersistence(
  queryClient: QueryClient,
): () => void {
  if (!isBrowser()) return () => undefined;

  let timeout: number | undefined;

  const persist = () => {
    timeout = undefined;
    try {
      const clientState = dehydrate(queryClient, {
        shouldDehydrateQuery: shouldPersistQuery,
      });
      window.localStorage.setItem(
        QUERY_CACHE_STORAGE_KEY,
        JSON.stringify({ persistedAt: Date.now(), clientState }),
      );
    } catch {
      /* Storage quota / private browsing: keep the app usable without persistence. */
    }
  };

  const schedulePersist = () => {
    if (timeout !== undefined) return;
    timeout = window.setTimeout(persist, PERSIST_DEBOUNCE_MS);
  };

  const unsubscribe = queryClient.getQueryCache().subscribe(schedulePersist);
  schedulePersist();

  return () => {
    unsubscribe();
    if (timeout !== undefined) {
      window.clearTimeout(timeout);
    }
  };
}

function normalizeScope(
  input: string | null | undefined,
  topic: string | null | undefined,
): WooCacheInvalidationScope {
  const scope = (input ?? "").toLowerCase().trim();
  if (
    scope === "products" ||
    scope === "categories" ||
    scope === "orders" ||
    scope === "reviews" ||
    scope === "all"
  ) {
    return scope;
  }

  const t = (topic ?? "").toLowerCase().trim();
  if (t.startsWith("product_cat.")) return "categories";
  if (t.startsWith("product.")) return "products";
  if (t.startsWith("order.")) return "orders";
  if (t.includes("review")) return "reviews";
  return "all";
}

function normalizeResourceId(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export function normalizeWooCacheInvalidationPayload(
  payload: WooCacheInvalidationPayload,
): Required<Pick<WooCacheInvalidationPayload, "scope">> &
  Pick<WooCacheInvalidationPayload, "topic" | "resourceId"> {
  const topic = typeof payload.topic === "string" ? payload.topic : null;
  const scope = normalizeScope(
    typeof payload.scope === "string" ? payload.scope : null,
    topic,
  );
  const resourceId = normalizeResourceId(payload.resourceId);
  return { scope, topic, resourceId: resourceId ?? null };
}

export function emitWooCacheInvalidation(
  payload: WooCacheInvalidationPayload,
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(WOO_CACHE_INVALIDATION_EVENT, {
      detail: normalizeWooCacheInvalidationPayload(payload),
    }),
  );
}

export function emitWooCacheInvalidationFromData(
  data: Record<string, unknown> | undefined,
): boolean {
  if (!data || data.type !== WOO_CACHE_INVALIDATION_MESSAGE_TYPE) return false;
  emitWooCacheInvalidation({
    type: WOO_CACHE_INVALIDATION_MESSAGE_TYPE,
    topic: typeof data.topic === "string" ? data.topic : null,
    resourceId:
      typeof data.resourceId === "string" || typeof data.resourceId === "number"
        ? data.resourceId
        : null,
    scope: typeof data.scope === "string" ? data.scope : null,
  });
  return true;
}

export function invalidateStorefrontQueriesFromWooEvent(
  queryClient: QueryClient,
  payload: WooCacheInvalidationPayload,
): void {
  const normalized = normalizeWooCacheInvalidationPayload(payload);
  const resourceId = normalizeResourceId(normalized.resourceId);

  if (
    normalized.scope === "products" ||
    normalized.scope === "categories" ||
    normalized.scope === "all"
  ) {
    void queryClient.invalidateQueries({
      queryKey: ["products"],
      refetchType: "active",
    });
  }

  if (
    normalized.scope === "categories" ||
    normalized.scope === "all"
  ) {
    void queryClient.invalidateQueries({
      queryKey: ["categories"],
      refetchType: "active",
    });
  }

  if (normalized.scope === "products" || normalized.scope === "all") {
    if (resourceId !== undefined) {
      void queryClient.invalidateQueries({
        queryKey: ["product", resourceId],
        refetchType: "active",
      });
      void queryClient.invalidateQueries({
        queryKey: ["reviews", resourceId],
        refetchType: "active",
      });
    } else {
      void queryClient.invalidateQueries({
        queryKey: ["product"],
        refetchType: "active",
      });
      void queryClient.invalidateQueries({
        queryKey: ["reviews"],
        refetchType: "active",
      });
    }
  }

  if (normalized.scope === "reviews") {
    if (resourceId !== undefined) {
      void queryClient.invalidateQueries({
        queryKey: ["reviews", resourceId],
        refetchType: "active",
      });
    } else {
      void queryClient.invalidateQueries({
        queryKey: ["reviews"],
        refetchType: "active",
      });
    }
  }
}
