"use client";

import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { AuthToken, LoginPayload } from "@/features/auth/types";

export async function login(payload: LoginPayload): Promise<AuthToken> {
  const response = await apiClient.post<AuthToken>("/auth/login", payload);
  const data = response.data;
  useAuthStore.getState().setAuth(data.token, {
    email: data.userEmail,
    nicename: data.userNicename,
    displayName: data.userDisplayName,
  });
  return data;
}
