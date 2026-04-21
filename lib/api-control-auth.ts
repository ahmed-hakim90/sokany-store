import "server-only";

import { NextRequest, NextResponse } from "next/server";
import {
  CONTROL_SESSION_COOKIE_NAME,
  verifyControlSessionToken,
} from "@/lib/control-session";

export async function requireControlSession(
  request: NextRequest,
): Promise<{ uid: string } | NextResponse> {
  const token = request.cookies.get(CONTROL_SESSION_COOKIE_NAME)?.value;
  if (!token?.trim()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { uid } = await verifyControlSessionToken(token);
    return { uid };
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
