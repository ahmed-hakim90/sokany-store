"use client";

import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export function useAuthSession() {
  const hasHydrated = useHasHydrated(useAuthStore);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return {
    hasHydrated,
    user: hasHydrated ? user : null,
    token: hasHydrated ? token : null,
    isAuthenticated: hasHydrated ? isAuthenticated : false,
  };
}
