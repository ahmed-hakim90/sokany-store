"use client";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { AuthToken, LoginPayload } from "@/features/auth/types";
import { apiClient } from "@/lib/api";
import { loginSessionResponseSchema } from "@/schemas/auth";

export async function login(payload: LoginPayload): Promise<AuthToken> {
  const response = await apiClient.post("/auth/login", payload);
  const data = loginSessionResponseSchema.parse(response.data);
  useAuthStore.getState().setAuth(data.token, {
    email: data.userEmail,
    nicename: data.userNicename,
    displayName: data.userDisplayName,
  });
  return data;
}
