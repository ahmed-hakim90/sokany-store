"use client";

/**
 * انتظار persist في Zustand
 * بالعامية: متاجر زي السلة والـ auth بتتقرا من localStorage؛ لازم نعرف امتى خلصت عشان ما نقارنش SSR مع بيانات قديمة في أول render.
 */
import { useEffect, useState } from "react";

type PersistApi = {
  hasHydrated: () => boolean;
  onHydrate: (listener: () => void) => () => void;
  onFinishHydration: (listener: () => void) => () => void;
};

type PersistStore = {
  persist?: PersistApi;
};

export function useHasHydrated(store: PersistStore) {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const persist = store.persist;
    if (!persist) {
      setHasHydrated(true);
      return;
    }

    if (persist.hasHydrated()) {
      setHasHydrated(true);
    }

    const unsubscribeHydrate = persist.onHydrate(() => setHasHydrated(false));
    const unsubscribeFinish = persist.onFinishHydration(() =>
      setHasHydrated(true),
    );

    return () => {
      unsubscribeHydrate();
      unsubscribeFinish();
    };
  }, [store]);

  return hasHydrated;
}
