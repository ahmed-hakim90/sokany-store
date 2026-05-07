"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCatalogFilterDrawerOpenStore } from "@/features/catalog/store/useCatalogFilterDrawerOpenStore";

const CatalogFilterDrawer = dynamic(
  () =>
    import("@/features/catalog/components/CatalogFilterDrawer").then(
      (m) => m.CatalogFilterDrawer,
    ),
  { ssr: false, loading: () => null },
);

/** Loads catalog filter drawer (+ form chunk) only after first open. */
export function CatalogFilterDrawerGate() {
  const open = useCatalogFilterDrawerOpenStore((s) => s.open);
  const [everOpen, setEverOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setEverOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);
  if (!open && !everOpen) return null;
  return <CatalogFilterDrawer />;
}
