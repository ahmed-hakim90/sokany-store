"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export type ControlSessionScope = "full" | "media";

export type ControlSession = {
  scope: ControlSessionScope;
  tabs: "all" | string[];
  mediaFolders: "all" | string[];
  superAdmin: boolean;
};

/** خطأ مخصص للجلسة غير المصرّح بها (401) — يسمح للمستهلك بإعادة التوجيه. */
export class ControlUnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "ControlUnauthorizedError";
  }
}

async function fetchControlSession(): Promise<ControlSession> {
  const res = await fetch("/api/control/session", { credentials: "include" });
  if (res.status === 401) {
    throw new ControlUnauthorizedError();
  }
  if (!res.ok) {
    throw new Error("تعذر التحقق من صلاحية الجلسة");
  }
  const j = (await res.json().catch(() => ({}))) as {
    scope?: ControlSessionScope;
    tabs?: "all" | string[];
    mediaFolders?: "all" | string[];
    superAdmin?: boolean;
  };
  return {
    scope: j.scope ?? "full",
    tabs: (j.tabs as "all" | string[] | undefined) ?? "all",
    mediaFolders: j.mediaFolders ?? "all",
    superAdmin: Boolean(j.superAdmin),
  };
}

export const CONTROL_SESSION_QUERY_KEY = ["control", "session"] as const;

/**
 * Hook موحد للتحقق من جلسة لوحة التحكم.
 * يعيد التوجيه تلقائيًا إلى /control/login عند 401.
 */
export function useControlSession() {
  const router = useRouter();
  const query = useQuery({
    queryKey: CONTROL_SESSION_QUERY_KEY,
    queryFn: fetchControlSession,
    staleTime: 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (query.error instanceof ControlUnauthorizedError) {
      router.replace("/control/login");
    }
  }, [query.error, router]);

  return query;
}
