"use client";

import { useSyncExternalStore } from "react";

function subscribeMinMd(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  if (typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMinMdSnapshot() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(min-width: 768px)").matches
  );
}

function getMinMdServerSnapshot() {
  return false;
}

/** `true` when viewport is Tailwind `md` (768px) and up. */
export function useMinMd() {
  return useSyncExternalStore(subscribeMinMd, getMinMdSnapshot, getMinMdServerSnapshot);
}
