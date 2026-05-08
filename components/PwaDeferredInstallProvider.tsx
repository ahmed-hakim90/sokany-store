"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type PwaInstallContextValue = {
  deferred: BeforeInstallPromptEvent | null;
  clearDeferred: () => void;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

/**
 * يُسجّل ‎`beforeinstallprompt`‎ مبكراً (قبل ‎`idle`‎) حتى لا يُفقد الحدث — يُستدعى ‎`prompt()`‎ من تفاعل المستخدم فقط.
 */
export function PwaDeferredInstallProvider({ children }: { children: React.ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const clearDeferred = useCallback(() => setDeferred(null), []);

  const value = useMemo(
    () => ({ deferred, clearDeferred }),
    [deferred, clearDeferred],
  );

  return (
    <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>
  );
}

export function usePwaDeferredInstall(): PwaInstallContextValue {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) {
    return { deferred: null, clearDeferred: () => {} };
  }
  return ctx;
}
