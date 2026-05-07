"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCartDrawerOpenStore } from "@/features/cart/store/useCartDrawerOpenStore";

const DesktopCartDrawer = dynamic(
  () =>
    import("@/features/cart/components/DesktopCartDrawer").then(
      (m) => m.DesktopCartDrawer,
    ),
  { ssr: false, loading: () => null },
);

/** Loads vaul/cart drawer chunk only after first open (keeps mounted for close animation). */
export function DesktopCartDrawerGate() {
  const open = useCartDrawerOpenStore((s) => s.open);
  const [everOpen, setEverOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setEverOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);
  if (!open && !everOpen) return null;
  return <DesktopCartDrawer />;
}
