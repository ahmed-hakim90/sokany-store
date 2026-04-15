"use client";

import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // ignore network errors; still clear local session
  } finally {
    useAuthStore.getState().clearAuth();
  }
}
