"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export function useRailScrollNav(
  scrollRef: RefObject<HTMLDivElement | null>,
  active: boolean,
  /** Bumps layout probe when this key changes. */
  layoutKey: string | number,
) {
  const [canScroll, setCanScroll] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const scrollNextSign = useRef(1);

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !active) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 2) {
      setCanScroll(false);
      setAtStart(true);
      setAtEnd(true);
      return;
    }
    setCanScroll(true);
    const sl = el.scrollLeft;
    const sign = scrollNextSign.current;
    if (sign > 0) {
      setAtStart(sl <= 2);
      setAtEnd(sl >= max - 2);
    } else {
      setAtStart(sl >= -2);
      setAtEnd(sl <= -max + 2);
    }
  }, [active, scrollRef]);

  const probeScrollSign = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !active) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 2) {
      scrollNextSign.current = 1;
      return;
    }
    const before = el.scrollLeft;
    el.scrollBy({ left: 50, behavior: "auto" });
    const d = el.scrollLeft - before;
    el.scrollBy({ left: -d, behavior: "auto" });
    if (d !== 0) {
      scrollNextSign.current = d > 0 ? 1 : -1;
    }
  }, [active, scrollRef]);

  useLayoutEffect(() => {
    if (!active) return;
    probeScrollSign();
    const id = requestAnimationFrame(() => {
      updateEdges();
    });
    return () => cancelAnimationFrame(id);
  }, [active, layoutKey, probeScrollSign, updateEdges]);

  useEffect(() => {
    if (!active) return;
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      probeScrollSign();
      updateEdges();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, layoutKey, probeScrollSign, updateEdges, scrollRef]);

  useEffect(() => {
    if (!active) return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateEdges();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [active, updateEdges, scrollRef]);

  const scrollNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(220, Math.floor(el.clientWidth * 0.65));
    el.scrollBy({ left: scrollNextSign.current * step, behavior: "smooth" });
  }, [scrollRef]);

  const scrollPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(220, Math.floor(el.clientWidth * 0.65));
    el.scrollBy({ left: -scrollNextSign.current * step, behavior: "smooth" });
  }, [scrollRef]);

  return { canScroll, atStart, atEnd, scrollNext, scrollPrev };
}
