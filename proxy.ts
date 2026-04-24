import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  CONTROL_SESSION_COOKIE_NAME,
  verifyControlSessionToken,
} from "@/lib/control-session";

function withRequestId(res: NextResponse, id: string): NextResponse {
  res.headers.set("X-Sokany-Request-Id", id);
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const id = globalThis.crypto.randomUUID();

  if (pathname.startsWith("/api/")) {
    return withRequestId(NextResponse.next(), id);
  }

  if (!pathname.startsWith("/control")) {
    return NextResponse.next();
  }
  if (pathname === "/control/login") {
    return withRequestId(NextResponse.next(), id);
  }

  const token = request.cookies.get(CONTROL_SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/control/login", request.url));
  }
  try {
    await verifyControlSessionToken(token);
    return withRequestId(NextResponse.next(), id);
  } catch {
    const res = NextResponse.redirect(new URL("/control/login", request.url));
    res.cookies.delete(CONTROL_SESSION_COOKIE_NAME);
    return res;
  }
}

export const config = {
  matcher: ["/api/:path*", "/control", "/control/:path*"],
};
