"use client";

import { useMemo, useSyncExternalStore } from "react";

/** افتراضي: ‎`grid-cols-2` × ‎`md:grid-cols-3` × ‎`lg:grid-cols-5`‎ (كتالوج المتجر). */
export const DEFAULT_CATALOG_GRID_COLUMN_COUNTS = {
  base: 2,
  md: 3,
  lg: 5,
} as const;

export type GridColumnCounts = {
  base: number;
  md: number;
  lg: number;
};

function resolveLayout(counts: GridColumnCounts): { columns: number; gapPx: number } {
  if (typeof window === "undefined") {
    return { columns: counts.base, gapPx: 12 };
  }
  const w = window.innerWidth;
  const columns = w >= 1024 ? counts.lg : w >= 768 ? counts.md : counts.base;
  const gapPx = w >= 640 ? 16 : 12;
  return { columns, gapPx };
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mqs = [
    window.matchMedia("(min-width: 1024px)"),
    window.matchMedia("(min-width: 768px)"),
    window.matchMedia("(min-width: 640px)"),
  ];
  const handler = () => {
    onStoreChange();
  };
  mqs.forEach((mq) => mq.addEventListener("change", handler));
  window.addEventListener("resize", handler);
  return () => {
    mqs.forEach((mq) => mq.removeEventListener("change", handler));
    window.removeEventListener("resize", handler);
  };
}

function getServerSnapshotLayout(counts: GridColumnCounts): {
  columns: number;
  gapPx: number;
} {
  return { columns: counts.base, gapPx: 12 };
}

/**
 * أعمدة الشبكة والمسافة الرأسية/الأفقية بالبكسل — متزامنة مع Tailwind (`sm:` للـ gap، `md`/`lg` للأعمدة).
 *
 * @param columnCounts — إن وُجد يُستخدم للشبكات المخصّصة (مثل ضمان ‎`lg:grid-cols-4`‎).
 */
function encodeLayoutSnapshot(layout: { columns: number; gapPx: number }): string {
  return `${layout.columns},${layout.gapPx}`;
}

function decodeLayoutSnapshot(token: string): { columns: number; gapPx: number } {
  const [c, g] = token.split(",").map(Number);
  return { columns: c, gapPx: g };
}

export function useGridColumns(columnCounts?: GridColumnCounts): {
  columns: number;
  gapPx: number;
} {
  const resolved = columnCounts ?? DEFAULT_CATALOG_GRID_COLUMN_COUNTS;
  const token = useSyncExternalStore(
    subscribe,
    () => encodeLayoutSnapshot(resolveLayout(resolved)),
    () => encodeLayoutSnapshot(getServerSnapshotLayout(resolved)),
  );
  return useMemo(() => decodeLayoutSnapshot(token), [token]);
}
