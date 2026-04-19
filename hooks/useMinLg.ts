"use client";

import { useSyncExternalStore } from "react";

function subscribeMinLg(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(min-width: 1024px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMinLgSnapshot() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
}

function getMinLgServerSnapshot() {
  return false;
}

/** `true` when viewport is Tailwind `lg` (1024px) and up. */
export function useMinLg() {
  return useSyncExternalStore(subscribeMinLg, getMinLgSnapshot, getMinLgServerSnapshot);
}
