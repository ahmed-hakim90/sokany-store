"use client";

import { apiClient } from "@/lib/api";
import { parseApiResponse } from "@/lib/parse-api-response";
import type { RegisterPayload } from "@/features/auth/types";
import { registerResponseSchema } from "@/schemas/auth";

export async function register(payload: RegisterPayload): Promise<void> {
  const response = await apiClient.post("/auth/register", payload);
  parseApiResponse(registerResponseSchema, response.data);
}
