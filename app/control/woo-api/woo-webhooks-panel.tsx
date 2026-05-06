"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SOKANY_WOO_WEBHOOK_RECIPES } from "@/features/woocommerce/woo-webhook-topics";

type SwhRow = {
  id: number;
  topic: string;
  name?: string;
  status?: string;
  delivery_url: string;
};

type GetRes = {
  ok: boolean;
  deliveryUrl: string;
  hasWebhookSecret: boolean;
  sokanyWebhooks: SwhRow[];
  allCount: number;
  recipes: typeof SOKANY_WOO_WEBHOOK_RECIPES;
  error?: string;
};

type PostRes = {
  ok: boolean;
  result?: {
    created: { topic: string; id: number }[];
    skipped: { topic: string; reason: string }[];
    failed: { topic: string; message: string }[];
  };
  error?: string;
};

/**
 * يربط الـ webhooks بـ REST لـ Woo من اللوحة (نفس ‎`WC_*` + ‎`WC_WEBHOOK_SECRET`‎).
 */
export function WooWebhooksPanel() {
  const [data, setData] = useState<GetRes | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<PostRes | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/control/woocommerce/webhooks", {
        credentials: "include",
      });
      const j = (await res.json()) as GetRes;
      if (!res.ok) {
        setErr(j.error ?? "تعذر التحميل");
        setData(null);
        return;
      }
      setData(j);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطأ شبكة");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/control/woocommerce/webhooks", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const j = (await res.json()) as PostRes;
      if (!res.ok) {
        setSyncResult({ ok: false, error: j.error ?? "فشل" });
        return;
      }
      setSyncResult(j);
      await load();
    } catch (e) {
      setSyncResult({
        ok: false,
        error: e instanceof Error ? e.message : "خطأ",
      });
    } finally {
      setSyncing(false);
    }
  }

  const needsSecret = data && !data.hasWebhookSecret;
  const topicsCovered = new Set(data?.sokanyWebhooks.map((w) => w.topic) ?? []);
  const requiredTopics = SOKANY_WOO_WEBHOOK_RECIPES.map((r) => r.topic);
  const missing = requiredTopics.filter((t) => !topicsCovered.has(t));

  if (loading) {
    return (
      <p className="text-sm text-slate-500">جاري جلب الـ webhooks…</p>
    );
  }

  if (err) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm text-amber-950">
        {err}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
      <h2 className="font-display text-sm font-bold text-slate-900">
        تجهيز التحديثات التلقائية من Woo
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        من هنا نراجع هل التحديثات الأساسية موجودة على Woo، ويمكننا إكمال الناقص تلقائيًا بدل ضبطه يدويًا.
      </p>

      {needsSecret ? (
        <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-2 text-sm text-rose-900">
          الربط غير مكتمل من جهة الخادم، لذلك لا يمكن إنشاء التحديثات التلقائية الآن.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          className="border-slate-200 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/80"
          disabled={!!needsSecret || syncing}
          onClick={() => void onSync()}
        >
          {syncing ? "جارٍ التجهيز..." : "إكمال الناقص تلقائيًا"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="border-slate-200"
          disabled={syncing}
          onClick={() => void load()}
        >
          تحديث القائمة
        </Button>
      </div>

      {missing.length > 0 ? (
        <p className="mt-2 text-xs text-amber-800">هناك تحديثات أساسية ناقصة وتحتاج إضافة.</p>
      ) : (
        <p className="mt-2 text-xs text-emerald-800">كل التحديثات الأساسية موجودة وجاهزة.</p>
      )}

      {syncResult && !syncResult.ok ? (
        <p className="mt-2 text-sm text-rose-800">{syncResult.error}</p>
      ) : null}
      {syncResult?.ok && syncResult.result ? (
        <div className="mt-3 text-xs text-slate-600">
          {syncResult.result.created.length > 0 ? (
            <p>
              تمت إضافة: {syncResult.result.created.map((c) => c.topic).join("، ")}
            </p>
          ) : null}
          {syncResult.result.failed.length > 0 ? (
            <ul className="mt-1 list-inside list-disc text-rose-800">
              {syncResult.result.failed.map((f) => (
                <li key={f.topic}>
                  <span dir="ltr" className="font-mono">
                    {f.topic}
                  </span>{" "}
                  — {f.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-900">الرابط الذي تستقبل عليه التحديثات</p>
          <p className="mt-1 break-all font-mono text-[11px] text-slate-500" dir="ltr">
            {data.deliveryUrl}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="border-slate-200 bg-white"
          onClick={() => {
            void navigator.clipboard.writeText(data.deliveryUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "تم النسخ" : "نسخ الرابط"}
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[300px] text-right text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500">
              <th className="px-2 py-2">نوع التحديث</th>
              <th className="px-2 py-2">معناه</th>
              <th className="px-2 py-2">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {data.recipes.map((r) => {
              const w = data.sokanyWebhooks.find((h) => h.topic === r.topic);
              return (
                <tr key={r.topic} className="border-b border-slate-100 last:border-0">
                  <td className="px-2 py-1.5 font-mono text-[11px] text-slate-800" dir="ltr">
                    {r.topic}
                  </td>
                  <td className="px-2 py-1.5 text-slate-700">{r.labelAr}</td>
                  <td className="px-2 py-1.5">
                    <span
                      className={
                        w
                          ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/15"
                          : "inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/15"
                      }
                    >
                      {w ? "جاهز" : "ناقص"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
