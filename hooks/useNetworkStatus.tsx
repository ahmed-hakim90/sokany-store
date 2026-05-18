"use client";

/**
 * حالة الشبكة للمتجر
 * بالعامية: `navigator.onLine` سريع لكن غالباً يكذب (خصوصاً localhost / VPN) — عند إشارة offline نؤكّد بـ HEAD لأصل ثابت قبل إظهار البانر.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { probeStorefrontConnectivity } from "@/lib/connectivity-probe";

export type NetworkStatus = {
  online: boolean;
  offline: boolean;
  /** انتقال من غير متصل إلى متصل — يُصفَّر بعد اكتمال دورة تحديث قصيرة */
  reconnecting: boolean;
  lastOnlineAt: number | null;
};

const NetworkStatusContext = createContext<NetworkStatus | null>(null);

const OFFLINE_HINT_DEBOUNCE_MS = 400;
const OFFLINE_REPROBE_INTERVAL_MS = 8_000;

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<number | null>(null);
  const offlineHintTimerRef = useRef<number | undefined>(undefined);
  const offlineReprobeTimerRef = useRef<number | undefined>(undefined);

  const markOnline = useCallback(() => {
    const now = Date.now();
    setLastOnlineAt(now);
    setOnline(true);
  }, []);

  const markOffline = useCallback(() => {
    setOnline(false);
    setReconnecting(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const clearOfflineHintTimer = () => {
      if (offlineHintTimerRef.current !== undefined) {
        window.clearTimeout(offlineHintTimerRef.current);
        offlineHintTimerRef.current = undefined;
      }
    };

    const clearOfflineReprobeTimer = () => {
      if (offlineReprobeTimerRef.current !== undefined) {
        window.clearInterval(offlineReprobeTimerRef.current);
        offlineReprobeTimerRef.current = undefined;
      }
    };

    const scheduleOfflineReprobe = () => {
      clearOfflineReprobeTimer();
      offlineReprobeTimerRef.current = window.setInterval(() => {
        void probeStorefrontConnectivity().then((reachable) => {
          if (cancelled || !reachable) return;
          clearOfflineReprobeTimer();
          markOnline();
        });
      }, OFFLINE_REPROBE_INTERVAL_MS);
    };

    const confirmOfflineHint = () => {
      clearOfflineHintTimer();
      offlineHintTimerRef.current = window.setTimeout(() => {
        offlineHintTimerRef.current = undefined;
        void probeStorefrontConnectivity().then((reachable) => {
          if (cancelled) return;
          if (reachable) {
            markOnline();
            return;
          }
          markOffline();
          scheduleOfflineReprobe();
        });
      }, OFFLINE_HINT_DEBOUNCE_MS);
    };

    const applyNavigatorHint = (hintOnline: boolean) => {
      clearOfflineHintTimer();
      if (hintOnline) {
        clearOfflineReprobeTimer();
        markOnline();
        return;
      }
      confirmOfflineHint();
    };

    applyNavigatorHint(navigator.onLine);

    const onOff = () => applyNavigatorHint(false);
    const onOn = () => {
      clearOfflineHintTimer();
      clearOfflineReprobeTimer();
      setReconnecting(true);
      markOnline();
      window.setTimeout(() => setReconnecting(false), 600);
    };

    window.addEventListener("offline", onOff);
    window.addEventListener("online", onOn);
    return () => {
      cancelled = true;
      clearOfflineHintTimer();
      clearOfflineReprobeTimer();
      window.removeEventListener("offline", onOff);
      window.removeEventListener("online", onOn);
    };
  }, [markOnline, markOffline]);

  const value = useMemo<NetworkStatus>(
    () => ({
      online,
      offline: !online,
      reconnecting,
      lastOnlineAt,
    }),
    [online, reconnecting, lastOnlineAt],
  );

  return (
    <NetworkStatusContext.Provider value={value}>{children}</NetworkStatusContext.Provider>
  );
}

export function useNetworkStatus(): NetworkStatus {
  const ctx = useContext(NetworkStatusContext);
  if (!ctx) {
    return {
      online: true,
      offline: false,
      reconnecting: false,
      lastOnlineAt: null,
    };
  }
  return ctx;
}
