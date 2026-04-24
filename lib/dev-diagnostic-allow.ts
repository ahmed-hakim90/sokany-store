import "server-only";

import type { NextRequest } from "next/server";

/**
 * نفس ‎`/api/dev/woo-status`‎: ‎`development` أو ‎`Authorization: Bearer DEV_WOO_DIAG_TOKEN`‎.
 */
export function isDevDiagnosticRequestAllowed(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  const secret = process.env.DEV_WOO_DIAG_TOKEN?.trim();
  if (!secret) {
    return false;
  }
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
