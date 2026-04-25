"use client";

import { useCallback, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return JSON.parse(item) as T;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        setStored(value);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      } catch {
        setStored(value);
      }
    },
    [key],
  );

  return [stored, setValue];
}
