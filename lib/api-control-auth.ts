import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { cmsPutKeyAllowedForTabIds, canRunSeed, type CmsDocumentPutKey } from "@/lib/control-cms-keys";
import { isControlPanelSuperAdminUid } from "@/lib/control-super-admins";
import { hasControlPanelTab } from "@/lib/control-panel-tab";
import type { ControlSessionPayload } from "@/lib/control-session-types";
import {
  CONTROL_SESSION_COOKIE_NAME,
  verifyControlSessionPayload,
} from "@/lib/control-session";

export async function requireControlSession(
  request: NextRequest,
): Promise<ControlSessionPayload | NextResponse> {
  const token = request.cookies.get(CONTROL_SESSION_COOKIE_NAME)?.value;
  if (!token?.trim()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return await verifyControlSessionPayload(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/** ‎`scope === "full"‎` — بدون فحص تبويب. */
export async function requireScopeFull(
  request: NextRequest,
): Promise<ControlSessionPayload | NextResponse> {
  const r = await requireControlSession(request);
  if (r instanceof NextResponse) return r;
  if (r.scope === "media") {
    return NextResponse.json(
      { error: "ليس لديك صلاحية سوى إدارة الوسائط" },
      { status: 403 },
    );
  }
  return r;
}

export function requireCmsPutKey(
  r: ControlSessionPayload,
  key: CmsDocumentPutKey,
): NextResponse | null {
  if (r.scope !== "full") {
    return NextResponse.json({ error: "ليس لديك صلاحية تعديل المحتوى" }, { status: 403 });
  }
  if (!cmsPutKeyAllowedForTabIds(key, r.tabs)) {
    return NextResponse.json({ error: "لا تملك صلاحية تعديل هذا القسم" }, { status: 403 });
  }
  return null;
}

export async function requireCanRunSeed(
  request: NextRequest,
): Promise<ControlSessionPayload | NextResponse> {
  const r = await requireControlSession(request);
  if (r instanceof NextResponse) return r;
  if (r.scope === "media") {
    return NextResponse.json(
      { error: "ليس لديك صلاحية سوى إدارة الوسائط" },
      { status: 403 },
    );
  }
  if (!canRunSeed(r.tabs)) {
    return NextResponse.json(
      { error: "تحتاج صلاحية الفروع أو الموزعين لاستيراد البيانات" },
      { status: 403 },
    );
  }
  return r;
}

export async function requireNotificationsAccess(
  request: NextRequest,
): Promise<ControlSessionPayload | NextResponse> {
  const r = await requireScopeFull(request);
  if (r instanceof NextResponse) return r;
  if (hasControlPanelTab(r, "notifications")) {
    return r;
  }
  if (r.tabs === "all") {
    return r;
  }
  return NextResponse.json(
    { error: "ليس لديك صلاحية إشعارات من هذا الحساب" },
    { status: 403 },
  );
}

export async function requireOrderForwardingAccess(
  request: NextRequest,
): Promise<ControlSessionPayload | NextResponse> {
  const r = await requireScopeFull(request);
  if (r instanceof NextResponse) return r;
  if (hasControlPanelTab(r, "orderForwarding")) {
    return r;
  }
  if (r.tabs === "all") {
    return r;
  }
  return NextResponse.json(
    { error: "ليس لديك صلاحية تكاملات الطلبات من هذا الحساب" },
    { status: 403 },
  );
}

export async function requireSuperAdminSession(
  request: NextRequest,
): Promise<ControlSessionPayload | NextResponse> {
  const r = await requireControlSession(request);
  if (r instanceof NextResponse) return r;
  if (!r.superAdmin && !isControlPanelSuperAdminUid(r.uid)) {
    return NextResponse.json(
      { error: "للمشرفين فائقي الدخول فقط" },
      { status: 403 },
    );
  }
  return r;
}
