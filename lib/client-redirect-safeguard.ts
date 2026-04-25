/**
 * Opt-in for UA-gated UX (e.g. iOS PWA hint). Normal visits skip these paths.
 * Use `?redirect=1` on the URL to enable.
 */
export function isClientRedirectSafeguardEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("redirect") === "1";
  } catch {
    return false;
  }
}
