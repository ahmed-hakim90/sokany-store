import "server-only";

import { USE_MOCK } from "@/lib/constants";
import { WOO_ENV_NOT_CONFIGURED_MESSAGE } from "@/lib/woo-env-errors";

/**
 * يحدد ما إذا كان مسار BFF يجب أن يخدم mock/snapshot بدل ‎`502`‎ بعد فشل Woo.
 * في التطوير فقط: إن كانت البيئة غير مُعدّة (لا أصل ولا مفاتيح) يُفضّل mock حتى يعمل الكتالوج بدون ‎`.env`‎ كامل.
 */
export function shouldUseWooBffMockFallback(error: unknown): boolean {
  if (USE_MOCK) return true;
  if (process.env.NODE_ENV !== "development") return false;
  return (
    error instanceof Error &&
    error.message === WOO_ENV_NOT_CONFIGURED_MESSAGE
  );
}
