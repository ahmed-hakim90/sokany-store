import { z } from "zod";

/** Validates the `q` value from `/search` URL (trimmed, max length). */
export const searchPageQuerySchema = z
  .string()
  .max(200)
  .transform((s) => s.trim());

export function normalizeSearchParamQ(
  value: string | string[] | undefined,
): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return "";
}

/** Resolves `q` for the search page (Zod + safe fallback if over max length). */
export function resolveSearchPageQuery(raw: string): string {
  const parsed = searchPageQuerySchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  return raw.trim().slice(0, 200);
}
