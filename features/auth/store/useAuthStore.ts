"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
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
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          state.isAuthenticated = true;
        }
      },
    },
  ),
);
