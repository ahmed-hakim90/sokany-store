import { z } from "zod";

/**
 * مُلخّص قابل للتخزين/العرض لأخطاء ‎Zod.
 */
export function zodIssuesToJsonString(
  err: z.ZodError,
  maxIssues: number = 20,
): string {
  return JSON.stringify(
    err.issues.slice(0, maxIssues).map((issue) => ({
      path: issue.path.length ? issue.path.map(String).join(".") : "(root)",
      message: issue.message,
      code: issue.code,
    })),
  );
}
