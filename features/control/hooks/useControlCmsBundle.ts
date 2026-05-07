"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ControlUnauthorizedError } from "@/features/control/hooks/useControlSession";

export type ControlCmsBundle = {
  site_config: unknown;
  home_hero: unknown;
  section_banners: unknown;
  branches: unknown;
  retailers: unknown;
  spotlights: unknown;
};

async function fetchControlCmsBundle(): Promise<ControlCmsBundle> {
  const res = await fetch("/api/control/cms", { credentials: "include" });
  if (res.status === 401) {
    throw new ControlUnauthorizedError();
  }
  if (!res.ok) {
    throw new Error("تعذر تحميل البيانات");
  }
  return (await res.json()) as ControlCmsBundle;
}

export const CONTROL_CMS_BUNDLE_QUERY_KEY = ["control", "cms-bundle"] as const;

/**
 * Hook موحد لجلب حزمة مستندات الـCMS من /api/control/cms.
 * يشترك في نفس الـcache بين ControlPanel وأي panel يستخدم site_config،
 * فلا يتكرر الطلب عند الانتقال بين الصفحات.
 */
export function useControlCmsBundle({
  enabled = true,
}: { enabled?: boolean } = {}) {
  const router = useRouter();
  const query = useQuery({
    queryKey: CONTROL_CMS_BUNDLE_QUERY_KEY,
    queryFn: fetchControlCmsBundle,
    staleTime: 30 * 1000,
    enabled,
    retry: false,
  });

  useEffect(() => {
    if (query.error instanceof ControlUnauthorizedError) {
      router.replace("/control/login");
    }
  }, [query.error, router]);

  return query;
}
