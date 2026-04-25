"use client";

import { apiClient } from "@/lib/api";
import { parseApiResponse } from "@/lib/parse-api-response";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { logoutResponseSchema } from "@/schemas/auth";

export async function logout(): Promise<void> {
  try {
    const response = await apiClient.post("/auth/logout");
    parseApiResponse(logoutResponseSchema, response.data);
  } catch {
    // ignore network errors; still clear local session
  } finally {
    useAuthStore.getState().clearAuth();
  }
}
