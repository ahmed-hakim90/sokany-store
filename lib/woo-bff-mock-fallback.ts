import "server-only";

/**
 * قرار: نرجع mock ولا 502؟
 * بالعامية: لو `NEXT_PUBLIC_USE_MOCK` شغال أو في dev ومفيش إعدادات Woo خالص، نفضّل بيانات وهمية بدل ما الصفحة تموت.
 *
 * ملاحظات:
 * - ليه: تجربة مطور أخف من غير سيرفر Woo كامل.
 * - في production غير dev: بس الـ mock flag يفتح السقوط الناعم.
 * - شوف كمان: `@/features/products/mock.ts`، `@/features/data-snapshot/server.ts`
 */
import { USE_MOCK } from "@/lib/constants";
import { WOO_ENV_NOT_CONFIGURED_MESSAGE } from "@/lib/woo-env-errors";

export function shouldUseWooBffMockFallback(error: unknown): boolean {
  if (USE_MOCK) return true;
  if (process.env.NODE_ENV !== "development") return false;
  return (
    error instanceof Error &&
    error.message === WOO_ENV_NOT_CONFIGURED_MESSAGE
  );
}
