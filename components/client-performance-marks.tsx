"use client";

import { useEffect } from "react";

const MARK = "sokany_store_hydrated";

/**
 * علامات ‎Performance API‎ خفيفة لقياس زمن الجاهزية بعد الترطيب الأول.
 */
export function ClientPerformanceMarks() {
  useEffect(() => {
    if (typeof performance === "undefined" || typeof performance.mark !== "function") {
      return;
    }
    try {
      performance.mark(MARK);
    } catch {
      /* تجاهل بصمت */
    }
  }, []);
  return null;
}
