import { NextRequest, NextResponse } from "next/server";
import { isDevDiagnosticRequestAllowed } from "@/lib/dev-diagnostic-allow";
import { getWooDiagnosticReport } from "@/lib/woo-diagnostics";

/**
 * يسمح بالتشخيص في: `NODE_ENV=development` أو
 * `Authorization: Bearer <DEV_WOO_DIAG_TOKEN>`.
 * لا تُرجع أسراراً في الـ JSON.
 */
export async function GET(request: NextRequest) {
  if (!isDevDiagnosticRequestAllowed(request)) {
    return new NextResponse(null, { status: 404 });
  }
  const body = await getWooDiagnosticReport();
  return NextResponse.json(body, { status: 200 });
}
