import "server-only";

import { cookies } from "next/headers";
import {
  CONTROL_SESSION_COOKIE_NAME,
  verifyControlSessionPayload,
} from "@/lib/control-session";
import type { ControlSessionPayload } from "@/lib/control-session-types";

export async function getControlSessionUser(): Promise<ControlSessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(CONTROL_SESSION_COOKIE_NAME)?.value;
  if (!token?.trim()) {
    return null;
  }
  try {
    return await verifyControlSessionPayload(token);
  } catch {
    return null;
  }
}
