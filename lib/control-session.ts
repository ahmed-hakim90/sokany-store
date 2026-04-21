import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "control_session";

const encoder = new TextEncoder();

function getSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET?.trim() || process.env.CONTROL_SESSION_JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_SECRET_OR_CONTROL_SESSION_JWT_SECRET");
  }
  return encoder.encode(secret);
}

export { COOKIE_NAME as CONTROL_SESSION_COOKIE_NAME };

export async function signControlSessionToken(uid: string): Promise<string> {
  return new SignJWT({ role: "control" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(uid)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());
}

export async function verifyControlSessionToken(
  token: string,
): Promise<{ uid: string }> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ["HS256"],
  });
  if (payload.role !== "control") {
    throw new Error("Invalid control session");
  }
  const sub = typeof payload.sub === "string" ? payload.sub : "";
  if (!sub) {
    throw new Error("Invalid control session subject");
  }
  return { uid: sub };
}
