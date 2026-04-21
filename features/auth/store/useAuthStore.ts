"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AUTH_TOKEN_KEY } from "@/lib/constants";
import type { AuthState, AuthUser } from "@/features/auth/types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (token: string, user: AuthUser) => {
        set({ token, user, isAuthenticated: true });
      },
      clearAuth: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: AUTH_TOKEN_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<Pick<AuthState, "token" | "user">> | undefined;
        const token = p?.token ?? null;
        const user = p?.user ?? null;
        return {
          ...current,
          token,
          user,
          isAuthenticated: Boolean(token),
        };
      },
    },
  ),
);
