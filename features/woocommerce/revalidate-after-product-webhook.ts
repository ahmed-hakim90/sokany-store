import "server-only";

import { revalidatePath } from "next/cache";

/**
 * After a verified WooCommerce product webhook, refresh Next.js cached routes that
 * embed product data from the server (metadata, RSC payloads).
 *
 * TanStack Query on the client keeps its own cache (`staleTime` in hooks such as
 * `useProducts`); it is not invalidated by this call. Shoppers still pick up API
 * changes when the query goes stale, on window refetch, or after navigation. For
 * near-real-time UI updates you would add polling, SSE, or a push channel — out
 * of scope for the webhook handler alone.
 */
export function revalidateAfterProductWebhook(productId?: number): void {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/search");
  revalidatePath("/categories");

  if (productId !== undefined && Number.isFinite(productId)) {
    revalidatePath(`/products/${productId}`);
  }
}
