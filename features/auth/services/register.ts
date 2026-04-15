"use client";

import { apiClient } from "@/lib/api";
import type { RegisterPayload } from "@/features/auth/types";

export async function register(payload: RegisterPayload): Promise<void> {
  await apiClient.post("/auth/register", payload);
}
