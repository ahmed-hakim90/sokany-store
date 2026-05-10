"use client";

/**
 * حالة الشبكة للمتجر
 * بالعامية: بنبدأ `online` علشان يطابق SSR، وبعدين `useEffect` يزامن مع `navigator`؛ `reconnecting` يفيد البانر والسحب للتحديث.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type NetworkStatus = {
  online: boolean;
  offline: boolean;
  /** انتقال من غير متصل إلى متصل — يُصفَّر بعد اكتمال دورة تحديث قصيرة */
  reconnecting: boolean;
  lastOnlineAt: number | null;
};

const NetworkStatusContext = createContext<NetworkStatus | null>(null);

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastOnlineAt, setLastOnlineAt] = useState<number | null>(null);

  const markOnline = useCallback(() => {
    const now = Date.now();
    setLastOnlineAt(now);
    setOnline(true);
  }, []);

  useEffect(() => {
    const connected = navigator.onLine;
    setOnline(connected);
    if (connected) {
      setLastOnlineAt(Date.now());
    }

    const onOff = () => {
      setOnline(false);
      setReconnecting(false);
    };
    const onOn = () => {
      setReconnecting(true);
      markOnline();
      window.setTimeout(() => setReconnecting(false), 600);
    };
    window.addEventListener("offline", onOff);
    window.addEventListener("online", onOn);
    return () => {
      window.removeEventListener("offline", onOff);
      window.removeEventListener("online", onOn);
    };
  }, [markOnline]);

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
