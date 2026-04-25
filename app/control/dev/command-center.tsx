"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HealthRes = {
  at: string;
  healthScore: number;
  healthLabel: "ok" | "degraded" | "down";
  firestore: { ok: boolean; enabled: boolean; latencyMs: number; error?: string };
  woo: {
    products: { ok: boolean; latencyMs?: number; httpStatus: number | null; schemaOk: boolean };
  };
};

type AggRes = {
  ok: boolean;
  enabled?: boolean;
  lastEventAt: string | null;
  successRatePercent: number | null;
  avgProcessingTimeMs: number | null;
  totalInWindow?: number;
  message?: string;
  error?: string;
};

type FeedItem = {
  id: string;
  receivedAt: string;
  status: "processed" | "failed";
  topic: string | null;
  eventType: string | null;
  error: string | null;
  processingTimeMs: number | null;
  zodValidationError: string | null;
  payloadPreview: string | null;
};

type FeedList = {
  ok: boolean;
  items: FeedItem[];
  nextCursor: string | null;
};

type DetailItem = {
  id: string;
  receivedAt: string;
  status: "processed" | "failed";
  topic: string | null;
  eventType: string | null;
  error: string | null;
  payloadExcerpt: string | null;
  zodValidationError: string | null;
  processingTimeMs: number | null;
  bodyBytes: number;
  bodySha256: string;
};

const pulseOk = "animate-pulse bg-emerald-500 shadow-[0_0_0_0_rgba(16,185,129,0.4)]";
const pulseBad = "animate-pulse bg-rose-500 shadow-[0_0_0_0_rgba(244,63,94,0.4)]";

function formatJsonish(s: string) {
  try {
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return s;
  }
}

export function CommandCenter({
  maskedHint,
}: {
  maskedHint: {
    hasConsumerKey: boolean;
    hasConsumerSecret: boolean;
    consumerKeyDisplay: string | null;
  };
}) {
  const [health, setHealth] = useState<HealthRes | null>(null);
  const [agg, setAgg] = useState<AggRes | null>(null);
  const [feed, setFeed] = useState<FeedList | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [lastActions, setLastActions] = useState<Record<string, string | null>>({});

  const load = useCallback(async () => {
    setErr(null);
    try {
      const [h, a, f] = await Promise.all([
        fetch("/api/control/health-check", { credentials: "include" }).then((r) => r.json()),
        fetch("/api/control/health/aggregates", { credentials: "include" }).then((r) => r.json()),
        fetch("/api/control/woocommerce/webhook-deliveries?limit=20", {
          credentials: "include",
        }).then((r) => r.json()),
      ]);
      if (h && typeof h === "object" && "error" in h) {
        setErr(String((h as { error: string }).error));
        setHealth(null);
      } else {
        setHealth(h as HealthRes);
      }
      if (a && "error" in a) {
        setErr((e) => e ?? String((a as { error: string }).error));
        setAgg(null);
      } else {
        setAgg(a as AggRes);
      }
      if (f && typeof f === "object" && f.ok) {
        setFeed(f as FeedList);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطأ تحميل");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetail = useCallback(async (id: string) => {
    try {
      const res = await fetch(
        `/api/control/woocommerce/webhook-deliveries?id=${encodeURIComponent(id)}`,
        { credentials: "include" },
      );
      const j = (await res.json()) as { ok?: boolean; item?: DetailItem; error?: string };
      if (res.ok && j.item) setDetail(j.item);
      else setLastActions((m) => ({ ...m, detail: j.error ?? "تعذر فتح التفاصيل" }));
    } catch (e) {
      setLastActions((m) => ({
        ...m,
        detail: e instanceof Error ? e.message : "خطأ",
      }));
    }
  }, []);

  const runTestWebhook = useCallback(async () => {
    setActionBusy("webhook");
    setLastActions((m) => ({ ...m, webhook: null }));
    try {
      const res = await fetch("/api/control/diagnostics/test-webhook", {
        method: "POST",
        credentials: "include",
      });
      const j = (await res.json()) as { ok?: boolean; status?: number; error?: string };
      setLastActions((m) => ({
        ...m,
        webhook: res.ok
          ? `HTTP ${j.status ?? "?"}${j.ok ? " OK" : ""}`
          : (j.error ?? "فشل"),
      }));
      void load();
    } catch (e) {
      setLastActions((m) => ({ ...m, webhook: e instanceof Error ? e.message : "خطأ" }));
    } finally {
      setActionBusy(null);
    }
  }, [load]);

  const runRevalidate = useCallback(async () => {
    setActionBusy("reval");
    setLastActions((m) => ({ ...m, reval: null }));
    try {
      const res = await fetch("/api/control/diagnostics/revalidate-cache", {
        method: "POST",
        credentials: "include",
      });
      const j = (await res.json()) as { ok?: boolean };
      setLastActions((m) => ({
        ...m,
        reval: res.ok && j.ok ? "تم إبطال الكاش" : "فشل",
      }));
    } catch (e) {
      setLastActions((m) => ({ ...m, reval: e instanceof Error ? e.message : "خطأ" }));
    } finally {
      setActionBusy(null);
    }
  }, []);

  const runSchema = useCallback(async () => {
    setActionBusy("schema");
    setLastActions((m) => ({ ...m, schema: null }));
    try {
      const res = await fetch("/api/control/diagnostics/schema-random-product", {
        credentials: "include",
      });
      const j = (await res.json()) as {
        ok?: boolean;
        schemaOk?: boolean;
        zodErrors?: string | null;
        productId?: number | null;
        error?: string;
        latencyMs?: number;
      };
      if (!res.ok) {
        setLastActions((m) => ({ ...m, schema: j.error ?? `HTTP ${res.status}` }));
        return;
      }
      setLastActions((m) => ({
        ...m,
        schema: j.schemaOk
          ? `طابق ‎#${j.productId ?? "—"} ‎(${(j.latencyMs ?? 0)} ms)‎`
          : `Zod: ${(j.zodErrors ?? "—").slice(0, 200)}${(j.zodErrors?.length ?? 0) > 200 ? "…" : ""}`,
      }));
    } catch (e) {
      setLastActions((m) => ({ ...m, schema: e instanceof Error ? e.message : "خطأ" }));
    } finally {
      setActionBusy(null);
    }
  }, []);

  const hLabel = health?.healthLabel;
  const livePulse =
    hLabel === "ok" ? pulseOk : hLabel === "degraded" ? "bg-amber-500" : pulseBad;

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Command center
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Site Health
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            نبض التكامل مع Woo: الكاش، سجل الويبهوك، واختبارات الاتصال. المفاتيح معروضة
            مموّهة فقط.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm">
            <span
              className={cn("h-2 w-2 rounded-full", livePulse, hLabel && "ring-2 ring-offset-1")}
            />
            {hLabel === "ok"
              ? "صحة جيدة"
              : hLabel === "degraded"
                ? "يحتاج انتباهاً"
                : hLabel === "down"
                  ? "تشخيص"
                  : "—"}
          </div>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 border-slate-200 bg-white shadow-sm"
            onClick={() => void load()}
            disabled={loading}
          >
            استعادة
          </Button>
          <Link
            href="/control/woo-api"
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-indigo-700 shadow-sm transition-colors hover:bg-slate-50/80"
          >
            Woo &amp; API
          </Link>
          {process.env.NODE_ENV === "development" ? (
            <a
              href="/api/dev/woo-status"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50/80"
            >
              JSON خام
            </a>
          ) : null}
        </div>
      </div>

      {err ? (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-2 text-sm text-rose-900">
          {err}
        </div>
      ) : null}

      <div className="mb-2 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
          <p className="text-[11px] font-semibold uppercase text-slate-500">واجهة ‎Woo (استجابة)</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900">
            {health?.woo?.products?.latencyMs != null
              ? `${health.woo.products.latencyMs} ms`
              : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
          <p className="text-[11px] font-semibold uppercase text-slate-500">نجاح ويبهوك (24 س)</p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900">
            {agg?.successRatePercent != null
              ? `${agg.successRatePercent.toFixed(0)}%`
              : "—"}
          </p>
          {agg && agg.enabled === false && (
            <p className="mt-1 text-xs text-amber-700">Firestore معطّل — لا بيانات.</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
          <p className="text-[11px] font-semibold uppercase text-slate-500">آخر حدث (سجل)</p>
          <p className="mt-2 line-clamp-2 font-mono text-sm font-medium text-slate-800">
            {agg?.lastEventAt
              ? new Date(agg.lastEventAt).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "medium" })
              : "—"}
          </p>
        </div>
      </div>

      <div className="mb-2 mt-6">
        <p className="text-sm font-bold text-slate-900">فحص ‎%‎ الصحة (مركّب)</p>
        <div className="mt-2 h-2.5 w-full max-w-sm overflow-hidden rounded-full bg-slate-200/90">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              (health?.healthScore ?? 0) >= 85
                ? "bg-emerald-500"
                : (health?.healthScore ?? 0) >= 50
                  ? "bg-amber-500"
                  : "bg-rose-500",
            )}
            style={{ width: `${Math.min(100, health?.healthScore ?? 0)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          ‎{health != null ? `${health.healthScore}%` : "—"} — ‎Firestore + ‎Woo + ‎Schema‎
        </p>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm text-slate-800">
        <p className="text-[11px] font-semibold uppercase text-slate-500">مفاتيح ‎(قناع)‎</p>
        <div className="mt-2 space-y-1.5 font-mono text-xs">
          <p>
            Consumer:{" "}
            {maskedHint.consumerKeyDisplay === null || !maskedHint.hasConsumerKey
              ? "غير مضبوط"
              : maskedHint.consumerKeyDisplay}
          </p>
          <p>Secret: {maskedHint.hasConsumerSecret ? "cs_****" : "غير مضبوط"}</p>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => void runTestWebhook()}
          disabled={actionBusy != null}
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {actionBusy === "webhook" ? "…" : "اختبار ويبهوك"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void runRevalidate()}
          disabled={actionBusy != null}
          className="border-slate-200"
        >
          {actionBusy === "reval" ? "…" : "تنظيف/إبطال الكاش"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void runSchema()}
          disabled={actionBusy != null}
          className="border-slate-200"
        >
          {actionBusy === "schema" ? "…" : "مُدقق سكيما (منتج عشوائي)"}
        </Button>
        {(lastActions.webhook || lastActions.reval || lastActions.schema || lastActions.detail) && (
          <p className="w-full text-xs text-slate-500">
            {lastActions.webhook && `ويبهوك: ${lastActions.webhook} ‎. `}
            {lastActions.reval && `كاش: ${lastActions.reval} ‎. `}
            {lastActions.schema && `سكيما: ${lastActions.schema} ‎. `}
            {lastActions.detail && `تفاصيل: ${lastActions.detail} ‎. `}
          </p>
        )}
      </div>

      <h2 className="mb-3 text-sm font-bold text-slate-900">تدفق الويبهوك</h2>
      {loading ? (
        <p className="text-sm text-slate-500">جاري التحميل…</p>
      ) : !feed || feed.items.length === 0 ? (
        <p className="text-sm text-slate-500">لا سجلات — أو ‎Firebase‎ غير مضبوط.</p>
      ) : (
        <ul className="space-y-2">
          {feed.items.map((row) => {
            const ok = row.status === "processed" && !row.zodValidationError;
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => void openDetail(row.id)}
                  className={cn(
                    "flex w-full items-start justify-between gap-3 rounded-lg border border-slate-200/80 bg-white px-3 py-2.5 text-left text-sm shadow-sm transition hover:border-indigo-300/60 hover:bg-slate-50/80",
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", ok ? pulseOk : pulseBad)} />
                      <span className="font-mono text-xs text-slate-600">
                        {row.topic || row.eventType || "—"}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {row.payloadPreview
                        ? row.payloadPreview
                        : row.error ?? (ok ? "تم" : "فشل معالجة")}
                    </p>
                  </div>
                  <div className="shrink-0 text-xs tabular-nums text-slate-500">
                    {row.processingTimeMs != null ? `${row.processingTimeMs} ms` : "—"}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[min(90vh,720px)] w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200/80 bg-white px-5 py-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">تفاصيل الحدث</h2>
                <p className="text-xs text-slate-500" dir="ltr">
                  {detail.receivedAt} · {detail.id}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setDetail(null)}
                className="shrink-0"
              >
                إغلاق
              </Button>
            </div>
            <div className="max-h-[55vh] space-y-3 overflow-y-auto px-5 py-4" dir="rtl">
              {detail.error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-2 text-sm text-rose-900">
                  {detail.error}
                </div>
              )}
              {detail.zodValidationError && (
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase text-amber-800">Zod</p>
                  <pre
                    className="max-h-40 overflow-auto rounded-lg border border-amber-200/80 bg-amber-50/40 p-2 font-mono text-xs text-amber-950"
                    dir="ltr"
                  >
                    {formatJsonish(detail.zodValidationError)}
                  </pre>
                </div>
              )}
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase text-slate-500">JSON (مقصوص في المخزن)</p>
                <pre
                  className="max-h-64 overflow-auto rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs text-slate-900"
                  dir="ltr"
                >
                  {detail.payloadExcerpt
                    ? formatJsonish(detail.payloadExcerpt)
                    : "—"}
                </pre>
              </div>
              <p className="text-xs text-slate-500" dir="ltr">
                {detail.bodyBytes} B · {detail.bodySha256.slice(0, 20)}…
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
