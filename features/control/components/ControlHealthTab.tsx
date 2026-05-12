"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Database, ShieldAlert, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ControlActionTile,
  ControlMiniGuide,
  ControlStatCard,
} from "@/features/control/components/control-page-chrome";
import { cn } from "@/lib/utils";

type HealthRes = {
  /** وقت تشغيل آخر فحص صحة مركّب */
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
  storage?: "memory";
  lastEventAt: string | null;
  successRatePercent: number | null;
  avgProcessingTimeMs: number | null;
  totalInWindow?: number;
  message?: string;
  error?: string;
};

type MaskedHint = {
  hasConsumerKey: boolean;
  hasConsumerSecret: boolean;
  consumerKeyDisplay: string | null;
  source: "env" | "firestore" | null;
};

const pulseOk = "animate-pulse bg-emerald-500 shadow-[0_0_0_0_rgba(16,185,129,0.4)]";
const pulseBad = "animate-pulse bg-rose-500 shadow-[0_0_0_0_rgba(244,63,94,0.4)]";

/**
 * تبويب «صحة الموقع» داخل /control — كان CommandCenter في /control/dev.
 * يجلب maskedHint عبر /api/control/diagnostics/masked-hint بدل الاعتماد على props
 * من السيرفر، لأنه يعمل الآن داخل ControlPanel كتبويب.
 */
export function ControlHealthTab() {
  const [health, setHealth] = useState<HealthRes | null>(null);
  const [agg, setAgg] = useState<AggRes | null>(null);
  const [maskedHint, setMaskedHint] = useState<MaskedHint | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [lastActions, setLastActions] = useState<Record<string, string | null>>({});

  const load = useCallback(async () => {
    setErr(null);
    try {
      const [h, a, m] = await Promise.all([
        fetch("/api/control/health-check", { credentials: "include" }).then((r) => r.json()),
        fetch("/api/control/health/aggregates", { credentials: "include" }).then((r) => r.json()),
        fetch("/api/control/diagnostics/masked-hint", { credentials: "include" }).then((r) => r.json()),
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
      if (m && typeof m === "object" && !("error" in m)) {
        setMaskedHint(m as MaskedHint);
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
  const credentialSourceLabel =
    maskedHint?.source === "env"
      ? "متغيرات البيئة"
      : maskedHint?.source === "firestore"
        ? "Firestore مشفر"
        : "غير مضبوط";
  const livePulse =
    hLabel === "ok" ? pulseOk : hLabel === "degraded" ? "bg-amber-500" : pulseBad;
  const healthStatusCopy =
    hLabel === "ok"
      ? {
          title: "الربط يعمل بشكل طبيعي",
          description:
            "Woo يستجيب، شكل البيانات متوافق، وسجل التحديثات لا يظهر مشكلة مؤثرة. تابع فقط آخر حدث Webhook بعد أي تعديل كبير.",
          tone: "emerald" as const,
        }
      : hLabel === "degraded"
        ? {
            title: "الربط يعمل لكن يحتاج مراجعة",
            description:
              "هناك جزء واحد على الأقل يحتاج انتباهًا، مثل بطء Woo أو نقص في سجل الويبهوك. راجع الكروت الصفراء وشغّل الفحص المناسب.",
            tone: "amber" as const,
          }
        : hLabel === "down"
          ? {
              title: "الربط يحتاج تشخيص الآن",
              description:
                "الفحص الحالي يشير إلى فشل واضح. ابدأ بفحص Woo ثم جرّب Webhook، وبعدها راجع مفاتيح الربط والروابط المحفوظة.",
              tone: "rose" as const,
            }
          : {
              title: loading ? "جاري تحميل حالة الربط" : "لم يتم تحميل حالة الربط",
              description:
                "اضغط تحديث الحالة للحصول على آخر قراءة من Woo وسجل التحديثات.",
              tone: "slate" as const,
            };
  const statusToneClass =
    healthStatusCopy.tone === "emerald"
      ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
      : healthStatusCopy.tone === "amber"
        ? "border-amber-200 bg-amber-50/80 text-amber-950"
        : healthStatusCopy.tone === "rose"
          ? "border-rose-200 bg-rose-50/80 text-rose-950"
          : "border-slate-200 bg-white text-slate-950";
  const nextSteps =
    hLabel === "ok"
      ? ["بعد تعديل منتج في Woo راقب آخر حدث.", "لو الواجهة تأخرت، استخدم تحديث الواجهة."]
      : hLabel === "degraded"
        ? ["شغّل فحص شكل البيانات.", "راجع الويبهوك الناقص أو البطيء.", "حدّث الحالة بعد أي إصلاح."]
        : hLabel === "down"
          ? ["تأكد من رابط Woo والمفاتيح.", "شغّل تجربة وصول تحديث جديد.", "راجع رسالة الخطأ في الكارت الأحمر."]
          : ["انتظر تحميل الفحص أو اضغط تحديث الحالة."];
  const overviewStats = [
    {
      label: "نبض Woo",
      value:
        health?.woo?.products?.latencyMs != null
          ? `${health.woo.products.latencyMs} ms`
          : "—",
      hint: "زمن آخر استجابة تقريبية من Woo عند فحص المنتجات.",
      tone:
        health?.woo?.products?.latencyMs != null &&
        health.woo.products.latencyMs < 1200
          ? "emerald"
          : "amber",
      icon: Activity,
    },
    {
      label: "نجاح الويبهوك",
      value:
        agg?.successRatePercent != null ? `${agg.successRatePercent.toFixed(0)}%` : "—",
      hint: "نسبة معالجة أحداث الويبهوك بنجاح خلال آخر 24 ساعة.",
      tone:
        agg?.successRatePercent != null && agg.successRatePercent >= 85
          ? "emerald"
          : "amber",
      icon: Workflow,
    },
    {
      label: "آخر حدث",
      value: agg?.lastEventAt ? "مسجل" : "لا يوجد",
      hint: agg?.lastEventAt
        ? new Date(agg.lastEventAt).toLocaleString("ar-EG", {
            dateStyle: "short",
            timeStyle: "medium",
          })
        : "لم يصل حدث جديد أو السجل غير مفعل.",
      tone: agg?.lastEventAt ? "brand" : "slate",
      icon: Database,
    },
    {
      label: "تقييم الصحة",
      value: health != null ? `${health.healthScore}%` : "—",
      hint: "درجة مركبة تعتمد على Firestore وWoo وتوافق البيانات.",
      tone:
        (health?.healthScore ?? 0) >= 85
          ? "emerald"
          : (health?.healthScore ?? 0) >= 50
            ? "amber"
            : "rose",
      icon: ShieldAlert,
    },
  ] as const;
  const actionTiles = [
    {
      key: "webhook",
      title: "تجربة وصول تحديث جديد",
      description: "شغّلها بعد تعديل الربط أو إذا أردت التأكد أن التحديثات تصل للموقع.",
      buttonLabel: actionBusy === "webhook" ? "جارٍ التنفيذ..." : "تشغيل التجربة",
      onClick: () => void runTestWebhook(),
      primary: true,
    },
    {
      key: "reval",
      title: "تحديث الواجهة بعد التعديل",
      description: "استخدمها لو البيانات تغيّرت لكن الموقع ما زال يعرض النسخة القديمة.",
      buttonLabel: actionBusy === "reval" ? "جارٍ التحديث..." : "تحديث الواجهة",
      onClick: () => void runRevalidate(),
      primary: false,
    },
    {
      key: "schema",
      title: "فحص شكل البيانات القادمة",
      description: "يتأكد أن البيانات الواصلة من المصدر مناسبة لعرضها داخل الموقع.",
      buttonLabel: actionBusy === "schema" ? "جارٍ الفحص..." : "تشغيل الفحص",
      onClick: () => void runSchema(),
      primary: false,
    },
  ] as const;

  return (
    <div className="space-y-6">
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
          تحديث الحالة
        </Button>
        {process.env.NODE_ENV === "development" ? (
          <a
            href="/api/dev/woo-status"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50/80"
          >
            عرض التشخيص الخام
          </a>
        ) : null}
      </div>

      <section className={cn("rounded-2xl border p-5 shadow-sm", statusToneClass)}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
              قراءة سريعة
            </p>
            <h3 className="mt-2 font-display text-xl font-bold">{healthStatusCopy.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 opacity-85">
              {healthStatusCopy.description}
            </p>
          </div>
          <div className="grid gap-2 text-sm lg:w-80">
            {nextSteps.map((step) => (
              <div
                key={step}
                className="rounded-xl border border-white/70 bg-white/75 px-3 py-2 text-slate-700 shadow-sm"
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((item) => (
          <ControlStatCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            tone={item.tone}
            icon={item.icon}
          />
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <ControlMiniGuide
          title="جرّب تحديثًا"
          badge="تجربة"
          description="استخدمها عندما تريد التأكد أن Woo يقدر ينادي الموقع وأن التحديث يصل بدون انتظار حدث حقيقي."
        />
        <ControlMiniGuide
          title="حدّث الواجهة"
          badge="نشر"
          description="استخدمها عندما تكون البيانات صحيحة في Woo لكن الصفحة العامة ما زالت تعرض نسخة قديمة بسبب الكاش."
        />
        <ControlMiniGuide
          title="افحص شكل البيانات"
          badge="متابعة"
          description="هذا الفحص يختار منتجًا عشوائيًا ويتأكد أن الحقول القادمة منه مناسبة للكود الذي يعرض المنتجات."
        />
      </section>

      {err ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-2 text-sm text-rose-900">
          {err}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
        <div className="mt-4 grid gap-3 text-xs text-slate-600 sm:grid-cols-3">
          <p>
            <span className="font-semibold text-slate-900">آخر فحص:</span>{" "}
            {health?.at
              ? new Date(health.at).toLocaleString("ar-EG", {
                  dateStyle: "short",
                  timeStyle: "medium",
                })
              : "—"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">مصدر المفاتيح:</span>{" "}
            {credentialSourceLabel}
          </p>
          <p>
            <span className="font-semibold text-slate-900">سجل الويبهوك:</span>{" "}
            {agg?.storage === "memory"
              ? "ذاكرة الخادم"
              : agg && agg.enabled === false
                ? "غير مفعل"
                : "متاح"}
          </p>
        </div>
      </div>

      <section className="grid gap-3 lg:grid-cols-3">
        {actionTiles.map((tile) => (
          <ControlActionTile
            key={tile.key}
            title={tile.title}
            description={tile.description}
            cta={(
              <Button
                type="button"
                onClick={tile.onClick}
                disabled={actionBusy != null}
                variant={tile.primary ? undefined : "secondary"}
                className={tile.primary ? "bg-indigo-600 text-white hover:bg-indigo-700" : "border-slate-200"}
              >
                {tile.buttonLabel}
              </Button>
            )}
          />
        ))}
      </section>

      {(lastActions.webhook || lastActions.reval || lastActions.schema) ? (
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 text-sm text-slate-700 shadow-sm ring-1 ring-slate-900/5">
          <p className="font-semibold text-slate-900">آخر نتيجة</p>
          <p className="mt-2 text-xs leading-6 text-slate-500">
            {lastActions.webhook && `تجربة التحديث: ${lastActions.webhook}. `}
            {lastActions.reval && `تحديث الواجهة: ${lastActions.reval}. `}
            {lastActions.schema && `فحص شكل البيانات: ${lastActions.schema}. `}
          </p>
        </div>
      ) : null}

      <details className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm text-slate-800">
        <summary className="cursor-pointer font-semibold text-slate-900">
          معلومات تقنية إضافية
        </summary>
        <div className="mt-3 space-y-1.5 font-mono text-xs">
          <p>
            Consumer:{" "}
            {!maskedHint || maskedHint.consumerKeyDisplay === null || !maskedHint.hasConsumerKey
              ? "غير مضبوط"
              : maskedHint.consumerKeyDisplay}
          </p>
          <p>Secret: {maskedHint?.hasConsumerSecret ? "cs_****" : "غير مضبوط"}</p>
          <p>Source: {credentialSourceLabel}</p>
        </div>
      </details>
    </div>
  );
}
