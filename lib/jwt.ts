import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return encoder.encode(secret);
}

export type SessionJwtPayload = {
  sub: string;
  email: string;
  nicename: string;
  displayName: string;
};

export async function signSessionToken(
  payload: SessionJwtPayload,
): Promise<string> {
  return new SignJWT({
    email: payload.email,
    nicename: payload.nicename,
    displayName: payload.displayName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionJwtPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ["HS256"],
  });
  const sub = typeof payload.sub === "string" ? payload.sub : "";
  const email = typeof payload.email === "string" ? payload.email : "";
  const nicename = typeof payload.nicename === "string" ? payload.nicename : "";
  const displayName =
    typeof payload.displayName === "string" ? payload.displayName : "";
  if (!sub || !email) {
    throw new Error("Invalid token payload");
  }
  return { sub, email, nicename, displayName };
}
