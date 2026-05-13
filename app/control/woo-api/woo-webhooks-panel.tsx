"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SOKANY_WOO_WEBHOOK_RECIPES } from "@/features/woocommerce/woo-webhook-topics";
import { cn } from "@/lib/utils";

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
        مزامنة Webhooks (من اللوحة)
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        يستدعي ووردبريس:{" "}
        <code className="rounded bg-slate-100 px-1" dir="ltr">GET/POST /wc/v3/webhooks</code>
        . يلزم{" "}
        <code className="rounded bg-slate-100 px-1" dir="ltr">WC_*</code> +{" "}
        <code className="rounded bg-slate-100 px-1" dir="ltr">WC_WEBHOOK_SECRET</code>.
      </p>

      {needsSecret ? (
        <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-2 text-sm text-rose-900">
          <strong>WC_WEBHOOK_SECRET</strong> غير مضبوط — أضفه في البيئة ثم أعِد المحاولة.
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
          {syncing ? "جاري المزامنة…" : "إنشاء/تفعيل الناقص في Woo"}
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
        <p className="mt-2 text-xs text-amber-800">
          ناقص على المتجر:{" "}
          {missing.map((t) => (
            <code key={t} className="mx-0.5 font-mono text-[11px]" dir="ltr">
              {t}
            </code>
          ))}
        </p>
      ) : (
        <p className="mt-2 text-xs text-emerald-800">جميع المواضيع المدعومة موجودة.</p>
      )}

      {syncResult && !syncResult.ok ? (
        <p className="mt-2 text-sm text-rose-800">{syncResult.error}</p>
      ) : null}
      {syncResult?.ok && syncResult.result ? (
        <div className="mt-3 text-xs text-slate-600">
          {syncResult.result.created.length > 0 ? (
            <p>
              أُنشئ: {syncResult.result.created.map((c) => c.topic).join("، ")}
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

      <p className="mt-2 text-xs text-slate-500" dir="ltr">
        {data.deliveryUrl}
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[300px] text-right text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500">
              <th className="px-2 py-2">topic</th>
              <th className="px-2 py-2">الوصف</th>
              <th className="px-2 py-2">Woo</th>
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
                      className={cn(
                        "text-xs font-medium",
                        w ? "text-emerald-700" : "text-slate-400",
                      )}
                    >
                      {w
                        ? `#${w.id} ${w.status ?? ""}`.trim()
                        : "—"}
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
