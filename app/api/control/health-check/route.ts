import { NextRequest, NextResponse } from "next/server";
import { getFullHealthCheck } from "@/lib/health/get-full-health-check";
import { requireScopeFull } from "@/lib/api-control-auth";

/**
 * ‎GET: نبض كامل (‎Firestore + Woo + ‎Zod) — لمركز ‎`/control/dev`‎.
 */
export async function GET(request: NextRequest) {
  const auth = await requireScopeFull(request);
  if (auth instanceof NextResponse) return auth;
  const body = await getFullHealthCheck();
  return NextResponse.json(body, { status: 200 });
}
