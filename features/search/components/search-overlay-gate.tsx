"use client";

import dynamic from "next/dynamic";
import { useSearchOverlayOpenStore } from "@/features/search/store/useSearchOverlayOpenStore";

const StorefrontSearchOverlay = dynamic(
  () =>
    import("@/features/search/components/storefront-search-overlay").then(
      (m) => m.StorefrontSearchOverlay,
    ),
  { ssr: false, loading: () => null },
);

export function SearchOverlayGate({
  quickKeywords,
}: {
  quickKeywords: readonly string[];
}) {
  const open = useSearchOverlayOpenStore((s) => s.open);
  if (!open) return null;
  return <StorefrontSearchOverlay quickKeywords={quickKeywords} />;
}
