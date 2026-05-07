"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useWishlistDrawerOpenStore } from "@/features/wishlist/store/useWishlistDrawerOpenStore";

const DesktopWishlistDrawer = dynamic(
  () =>
    import("@/features/wishlist/components/DesktopWishlistDrawer").then(
      (m) => m.DesktopWishlistDrawer,
    ),
  { ssr: false, loading: () => null },
);

/** Loads vaul/wishlist drawer chunk only after first open (keeps mounted for close animation). */
export function DesktopWishlistDrawerGate() {
  const open = useWishlistDrawerOpenStore((s) => s.open);
  const [everOpen, setEverOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setEverOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);
  if (!open && !everOpen) return null;
  return <DesktopWishlistDrawer />;
}
