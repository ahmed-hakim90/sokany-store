import { SignJWT, jwtVerify } from "jose";

import type { ControlSessionPayload } from "@/lib/control-session-types";
import type { ControlPanelAccess } from "@/lib/control-auth";

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

type JwtPayloadShape = {
  role?: unknown;
  sub?: unknown;
  scope?: unknown;
  tA?: unknown;
  tabs?: unknown;
  mA?: unknown;
  mf?: unknown;
  su?: unknown;
};

/** ‎@deprecated — استخدم ‎`signControlSessionPayload`‎. */
export async function signControlSessionToken(
  uid: string,
  scope: ControlPanelAccess = "full",
): Promise<string> {
  if (scope === "media") {
    return signControlSessionPayload({
      uid,
      scope: "media",
      tabs: ["media"],
      mediaFolders: "all",
      superAdmin: false,
    });
  }
  return signControlSessionPayload({
    uid,
    scope: "full",
    tabs: "all",
    mediaFolders: "all",
    superAdmin: false,
  });
}

export async function signControlSessionPayload(p: ControlSessionPayload): Promise<string> {
  const claims: Record<string, unknown> = { role: "control", scope: p.scope };
  if (p.scope === "media") {
    claims.tA = false;
    claims.tabs = ["media"];
  } else if (p.tabs === "all") {
    claims.tA = true;
  } else {
    claims.tA = false;
    claims.tabs = p.tabs;
  }
  if (p.mediaFolders === "all") {
    claims.mA = true;
  } else {
    claims.mA = false;
    claims.mf = p.mediaFolders;
  }
  if (p.superAdmin) {
    claims.su = true;
  }
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.uid)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSecret());
}

export async function verifyControlSessionToken(token: string): Promise<ControlSessionPayload> {
  return verifyControlSessionPayload(token);
}

export async function verifyControlSessionPayload(token: string): Promise<ControlSessionPayload> {
  const { payload: rawP } = await jwtVerify(token, getSecret(), {
    algorithms: ["HS256"],
  });
  const payload = rawP as JwtPayloadShape;
  if (payload.role !== "control") {
    throw new Error("Invalid control session");
  }
  const sub = typeof payload.sub === "string" ? payload.sub : "";
  if (!sub) {
    throw new Error("Invalid control session subject");
  }
  const scope: ControlPanelAccess = payload.scope === "media" ? "media" : "full";
  const isLegacy = payload.tA === undefined && !Array.isArray(payload.tabs);
  let tabs: "all" | string[];
  if (isLegacy) {
    tabs = scope === "media" ? ["media"] : "all";
  } else if (payload.tA === true) {
    tabs = "all";
  } else {
    const t = Array.isArray(payload.tabs) ? payload.tabs.map((x) => String(x)) : [];
    tabs = t;
  }
  let mediaFolders: "all" | string[];
  if (payload.mA === true || (payload.mA === undefined && payload.mf === undefined)) {
    mediaFolders = "all";
  } else {
    mediaFolders = Array.isArray(payload.mf) ? (payload.mf as string[]).map(String) : [];
  }
  const out: ControlSessionPayload = {
    uid: sub,
    scope,
    tabs: scope === "media" ? ["media"] : tabs,
    mediaFolders,
    superAdmin: payload.su === true,
  };
  return out;
}
