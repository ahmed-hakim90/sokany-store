import { decodeJwt } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { signSessionToken } from "@/lib/jwt";
import { getWordPressJwtTokenUrl } from "@/lib/wp-url";
import type { LoginPayload } from "@/features/auth/types";

type WpJwtSuccess = {
  token?: string;
  user_email?: string;
  user_nicename?: string;
  user_display_name?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest) {
  const bodyUnknown: unknown = await request.json();
  if (!isRecord(bodyUnknown)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const username = bodyUnknown.username;
  const password = bodyUnknown.password;
  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }
  const payload: LoginPayload = { username, password };

  try {
    const url = getWordPressJwtTokenUrl();
    const wpRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: payload.username,
        password: payload.password,
      }),
    });
    const raw: unknown = await wpRes.json();
    if (!wpRes.ok) {
      return NextResponse.json({ error: "Login failed" }, { status: 401 });
    }
    if (!isRecord(raw)) {
      return NextResponse.json({ error: "Login failed" }, { status: 401 });
    }
    const wp = raw as WpJwtSuccess;
    let email = typeof wp.user_email === "string" ? wp.user_email : "";
    const nicename =
      typeof wp.user_nicename === "string" ? wp.user_nicename : payload.username;
    const displayName =
      typeof wp.user_display_name === "string"
        ? wp.user_display_name
        : payload.username;
    const wpToken = typeof wp.token === "string" ? wp.token : "";
    if (!email && wpToken) {
      const decoded = decodeJwt(wpToken);
      const decodedEmail = decoded.email;
      if (typeof decodedEmail === "string") {
        email = decodedEmail;
      }
    }
    if (!email) {
      email = `${payload.username}@customers.local`;
    }
    const sessionToken = await signSessionToken({
      sub: nicename,
      email,
      nicename,
      displayName,
    });
    return NextResponse.json({
      token: sessionToken,
      userEmail: email,
      userNicename: nicename,
      userDisplayName: displayName,
    });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
