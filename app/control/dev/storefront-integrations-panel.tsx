"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StorefrontIntegrationsForm } from "@/features/control/components/StorefrontIntegrationsForm";
import { putCmsRequest } from "@/features/control/lib/control-cms-put";
import { mergeSiteConfigPatch } from "@/features/control/lib/site-config-merge";
import type { CmsSiteConfigDoc } from "@/schemas/cms";

type CmsBundle = { site_config: unknown };

export function StorefrontIntegrationsPanel() {
  const router = useRouter();
  const [siteConfig, setSiteConfig] = useState<Partial<CmsSiteConfigDoc> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/control/cms");
      if (res.status === 401) {
        router.replace("/control/login");
        return;
      }
      if (!res.ok) throw new Error("تعذر تحميل الإعدادات");
      const data = (await res.json()) as CmsBundle;
      setSiteConfig(data.site_config as Partial<CmsSiteConfigDoc> | null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطأ تحميل");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSave = useCallback(
    async (patch: Partial<CmsSiteConfigDoc>) => {
      setSaving(true);
      try {
        await putCmsRequest(
          "site_config",
          mergeSiteConfigPatch(siteConfig, patch),
        );
        toast.success("تم الحفظ");
        await load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "فشل الحفظ");
      } finally {
        setSaving(false);
      }
    },
    [siteConfig, load],
  );

  if (loading) {
    return (
      <div
        id="storefront-integrations"
        className="mx-auto w-full min-w-0 max-w-5xl px-4 pb-10 pt-2 sm:px-5"
      >
        <p className="text-sm text-slate-500">جاري تحميل تكاملات المتجر…</p>
      </div>
    );
  }

  return (
    <div
      id="storefront-integrations"
      className="mx-auto w-full min-w-0 max-w-5xl px-4 pb-10 pt-2 sm:px-5"
    >
      <div className="mb-4 border-t border-slate-200/90 pt-8">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          عناوين البنية و API
        </p>
        <h2 className="font-display mt-1 text-xl font-bold tracking-tight text-slate-900">
          تكاملات الواجهة والووردبريس
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          نفس الحقول التي كانت في تبويب «عام» — مخصّصة للمسؤولين التقنيين ضمن صفحة التشخيص.
        </p>
      </div>
      <StorefrontIntegrationsForm
        key={JSON.stringify(siteConfig?.storefrontIntegrations ?? null)}
        initial={siteConfig?.storefrontIntegrations}
        disabled={saving}
        onSave={(doc) => void onSave({ storefrontIntegrations: doc })}
      />
    </div>
  );
}
