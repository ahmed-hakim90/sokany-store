import { NextRequest, NextResponse } from "next/server";
import { isDevDiagnosticRequestAllowed } from "@/lib/dev-diagnostic-allow";
import { getFullHealthCheck } from "@/lib/health/get-full-health-check";

/**
 * ‎GET: مثل ‎`/api/control/health-check` لكن بلا جلسة لوحة — ‎`NODE_ENV=development` أو ‎`DEV_WOO_DIAG_TOKEN`‎.
 * لا تُرجع أسراراً.
 */
export async function GET(request: NextRequest) {
  if (!isDevDiagnosticRequestAllowed(request)) {
    return new NextResponse(null, { status: 404 });
  }
  const body = await getFullHealthCheck();
  return NextResponse.json(body, { status: 200 });
}
