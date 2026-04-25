"use client";

import axios from "axios";
import { apiClient } from "@/lib/api";
import { parseApiResponse } from "@/lib/parse-api-response";
import type { RegisterPayload } from "@/features/auth/types";
import { registerResponseSchema } from "@/schemas/auth";

export async function registerCustomer(
  payload: RegisterPayload,
): Promise<{ customerId: number }> {
  try {
    const response = await apiClient.post("/auth/register", payload);
    const data = parseApiResponse(registerResponseSchema, response.data);
    return { customerId: data.customerId };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data && typeof e.response.data === "object") {
      const err = (e.response.data as { error?: unknown }).error;
      if (typeof err === "string" && err.length > 0) {
        throw new Error(err);
      }
    }
    throw e;
  }
}
