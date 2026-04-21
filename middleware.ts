import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  CONTROL_SESSION_COOKIE_NAME,
  verifyControlSessionToken,
} from "@/lib/control-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/control")) {
    return NextResponse.next();
  }
  if (pathname === "/control/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(CONTROL_SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/control/login", request.url));
  }
  try {
    await verifyControlSessionToken(token);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/control/login", request.url));
    res.cookies.delete(CONTROL_SESSION_COOKIE_NAME);
    return res;
  }
}

export const config = {
  matcher: ["/control", "/control/:path*"],
};
