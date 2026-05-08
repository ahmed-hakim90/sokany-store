"use client";

import { useCallback, useEffect, useState } from "react";

export type UseNearViewportOptions = {
  /**
   * Expand the intersection root so prefetch starts before the section enters view.
   * @default "0px 0px 480px 0px" (preload ~480px below viewport)
   */
  rootMargin?: string;
  /** @default true */
  once?: boolean;
  /** Start as near (e.g. eager homepage rail). @default false */
  initialNear?: boolean;
};

/**
 * IntersectionObserver gate for lazy data + heavy UI (grids, images).
 * SSR-safe: starts false unless `initialNear`.
 * Uses state for the observed element so the effect runs after the ref attaches.
 */
export function useNearViewport(options?: UseNearViewportOptions) {
  const {
    rootMargin = "0px 0px 480px 0px",
    once = true,
    initialNear = false,
  } = options ?? {};
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [near, setNear] = useState(initialNear);

  const setRef = useCallback((el: HTMLElement | null) => {
    setTarget(el);
  }, []);

  useEffect(() => {
    if (near || initialNear || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          setNear(true);
          if (once) observer.disconnect();
          return;
        }
      },
      { root: null, rootMargin, threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [target, near, initialNear, once, rootMargin]);

  return { ref: setRef, near: near || initialNear };
}
