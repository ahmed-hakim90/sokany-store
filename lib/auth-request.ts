import type { NextRequest } from "next/server";
import { verifySessionToken, type SessionJwtPayload } from "@/lib/jwt";

export function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  return header.slice(7).trim();
}

export async function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionJwtPayload | null> {
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }
  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
