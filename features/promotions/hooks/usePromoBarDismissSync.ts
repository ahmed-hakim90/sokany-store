"use client";

import { useEffect, useState } from "react";
import { PROMO_BAR_DISMISS_EVENT } from "@/features/promotions/lib/promo-bar-dismiss";

/** يعيد رقم مراجعة يتغيّر عند إخفاء كوبون (نفس التبويب أو مكوّن آخر). */
export function usePromoBarDismissSync(): number {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const onDismissed = () => setRevision((r) => r + 1);
    window.addEventListener(PROMO_BAR_DISMISS_EVENT, onDismissed);
    return () => window.removeEventListener(PROMO_BAR_DISMISS_EVENT, onDismissed);
  }, []);

  return revision;
}
