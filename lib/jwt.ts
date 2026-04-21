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
  /** Set when the session was issued after Firebase Phone Auth — used to match Woo `meta_data` `firebase_uid`. */
  firebaseUid?: string;
};

export async function signSessionToken(
  payload: SessionJwtPayload,
): Promise<string> {
  const claims: Record<string, unknown> = {
    email: payload.email,
    nicename: payload.nicename,
    displayName: payload.displayName,
  };
  if (payload.firebaseUid) {
    claims.firebaseUid = payload.firebaseUid;
  }
  return new SignJWT(claims)
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
  const firebaseUid =
    typeof payload.firebaseUid === "string" ? payload.firebaseUid : undefined;
  if (!sub || !email) {
    throw new Error("Invalid token payload");
  }
  return { sub, email, nicename, displayName, firebaseUid };
}
