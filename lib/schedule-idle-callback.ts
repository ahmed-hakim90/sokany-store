/**
 * Runs work after the browser is idle (or after `timeout` ms), with a setTimeout fallback.
 * For post-hydration deferral: timers, subscriptions, non-critical JSON work.
 */
export function scheduleIdleCallback(
  callback: () => void,
  options?: { timeout?: number },
): () => void {
  if (typeof window === "undefined") return () => {};
  const timeout = options?.timeout ?? 2000;
  const ric = window.requestIdleCallback;
  if (typeof ric === "function") {
    const id = ric(() => callback(), { timeout });
    return () => {
      window.cancelIdleCallback?.(id);
    };
  }
  const id = window.setTimeout(callback, Math.min(timeout, 1200));
  return () => clearTimeout(id);
}
