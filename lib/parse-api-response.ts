"use client";

import type { ZodType } from "zod";

/**
 * Shared boundary parser for feature services that consume API JSON.
 * Throws an explicit error when the response shape does not match schema.
 */
export function parseApiResponse<T>(schema: ZodType<T>, data: unknown): T {
  const parsed = schema.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }

  throw new Error("Invalid API response shape", {
    cause: parsed.error,
  });
}
