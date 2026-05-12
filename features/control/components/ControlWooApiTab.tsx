"use client";

import { useCallback, useEffect, useState } from "react";
import { DatabaseZap, PackageSearch, Radar, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ControlAsyncState,
  ControlMiniGuide,
  ControlStatCard,
  CopyableCode,
} from "@/features/control/components/control-page-chrome";
import type { WooDiagnosticReport } from "@/lib/woo-diagnostics";
import { EXTERNAL_DATA_WEBHOOK_SIGNATURE_HEADER_DEFAULT } from "@/lib/external-data-webhook-constants";
import { cn } from "@/lib/utils";
import { WooWebhookDeliveriesPanel } from "@/features/control/components/woo-webhook-deliveries-panel";
import { WooWebhooksPanel } from "@/features/control/components/woo-webhooks-panel";

type WooApiSummary = {
  report: WooDiagnosticReport;
  publicReadBaseUrl: string | null;
  cmsWooBaseUrl: string | null;
  cmsPublicStorefrontBaseUrl: string | null;
  cmsExternalDataWebhookUrl: string | null;
  webhookEndpointUrl: string;
  externalDataWebhookUrl: string;
};

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        ok
          ? "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-600/15"
          : "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-600/15",
      )}
    >
      {label}
    </span>
  );
}

function DataRow({
  k,
  v,
}: {
  k: string;
  v: string | number | boolean | null;
}) {
  const display = v === null || v === "" ? "—" : String(v);
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0">
      <span className="shrink-0 text-slate-500">{k}</span>
      <span className="min-w-0 break-all text-right font-mono text-slate-900 tabular-nums">
        {display}
      </span>
    </div>
  );
}

function ProbeCard({
  title,
  description,
  endpoint,
  probe,
}: {
  title: string;
  description: string;
  endpoint: string;
  probe: WooDiagnosticReport["products"];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3">
        <h2 className="font-display text-sm font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
        <p className="mt-2 font-mono text-[11px] text-slate-500">{endpoint}</p>
      </div>
      <div className="px-5 py-4">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {probe.httpStatus != null ? (
            <StatusPill
              ok={probe.ok}
              label={
                probe.ok
                  ? `الاستجابة سليمة (${probe.httpStatus})`
                  : `الاستجابة تحتاج مراجعة (${probe.httpStatus})`
              }
            />
          ) : (
            <span className="text-xs text-slate-500">— HTTP</span>
          )}
          <StatusPill
            ok={probe.schemaOk}
            label={probe.schemaOk ? "شكل البيانات سليم" : "شكل البيانات يحتاج ضبط"}
          />
          <span className="text-xs text-slate-500">
            عدد العينات: {probe.sampleCount}
          </span>
        </div>
        {probe.error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-2 text-sm text-rose-900">
            {probe.error}
          </div>
        ) : null}
        {probe.zodErrors && probe.zodErrors.length > 0 ? (
          <div className="mt-3 overflow-x-auto rounded-lg border border-amber-200/80 bg-amber-50/40">
            <table className="w-full min-w-[280px] text-left text-xs">
              <thead>
                <tr className="border-b border-amber-200/60 text-slate-600">
                  <th className="px-3 py-2 font-medium">path</th>
                  <th className="px-3 py-2 font-medium">code</th>
                  <th className="px-3 py-2 font-medium">message</th>
                </tr>
              </thead>
              <tbody>
                {probe.zodErrors.map((z, i) => (
                  <tr key={i} className="border-b border-amber-100/80 last:border-0">
                    <td className="px-3 py-2 font-mono text-slate-800">{z.path}</td>
                    <td className="px-3 py-2 font-mono text-slate-600">{z.code}</td>
                    <td className="px-3 py-2 text-slate-800">{z.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {probe.sample && Object.keys(probe.sample).length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              مثال من البيانات القادمة
            </p>
            <div className="rounded-lg border border-slate-200/80 bg-slate-50/50">
              {Object.entries(probe.sample).map(([k, v]) => (
                <DataRow key={k} k={k} v={v} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * تبويب «الربط» داخل /control — كان WooApiDashboard في /control/woo-api.
 * يجلب الملخص عبر /api/control/woo-api-summary حتى لا تكون الصفحة بحاجة
 * إلى عرض server-only.
 */
export function ControlWooApiTab() {
  const [summary, setSummary] = useState<WooApiSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/control/woo-api-summary", {
        credentials: "include",
      });
      const j = (await res.json()) as
        | (WooApiSummary & { error?: undefined })
        | { error: string };
      if (!res.ok || "error" in j) {
        setErr(("error" in j ? j.error : null) ?? "تعذر تحميل ملخص الربط");
        setSummary(null);
        return;
      }
      setSummary(j as WooApiSummary);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطأ شبكة");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || err || !summary) {
    return (
      <ControlAsyncState
        loading={loading}
        error={err}
        loadingLabel="جاري تحميل ملخص الربط…"
        onRetry={() => void load()}
      />
    );
  }

  const {
    report,
    publicReadBaseUrl,
    cmsWooBaseUrl,
    cmsPublicStorefrontBaseUrl,
    cmsExternalDataWebhookUrl,
    webhookEndpointUrl,
    externalDataWebhookUrl,
  } = summary;

  function copyJson() {
    void navigator.clipboard.writeText(
      JSON.stringify(
        {
          wooDiagnostic: report,
          cmsPublicReadBaseUrl: publicReadBaseUrl,
          cmsWooBaseUrl,
          cmsPublicStorefrontBaseUrl,
          cmsExternalDataWebhookUrl,
        },
        null,
        2,
      ),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const overviewStats = [
    {
      label: "فحص المنتجات",
      value: report.products.ok ? "سليم" : "يحتاج مراجعة",
      hint:
        report.products.httpStatus != null
          ? `آخر استجابة HTTP ${report.products.httpStatus}`
          : "لا توجد استجابة مؤكدة بعد.",
      tone: report.products.ok ? "emerald" : "rose",
      icon: PackageSearch,
    },
    {
      label: "فحص التصنيفات",
      value: report.categories.ok ? "سليم" : "يحتاج مراجعة",
      hint:
        report.categories.httpStatus != null
          ? `آخر استجابة HTTP ${report.categories.httpStatus}`
          : "الربط مع التصنيفات يحتاج تأكيد.",
      tone: report.categories.ok ? "emerald" : "rose",
      icon: Radar,
    },
    {
      label: "مصدر البيانات",
      value: report.wooEnvConfigured ? "مضبوط" : "غير مضبوط",
      hint: report.wcBaseUrl
        ? `العنوان الفعلي: ${report.wcBaseUrl}`
        : "هذا هو العنوان الذي يعتمد عليه الموقع للوصول إلى المنتجات.",
      tone: report.wooEnvConfigured ? "brand" : "amber",
      icon: DatabaseZap,
    },
    {
      label: "نوع القراءة",
      value: report.useMock ? "تجريبية" : "مباشرة",
      hint: report.useMock
        ? "الموقع يعمل على بيانات تجريبية مؤقتًا."
        : "القراءة الحالية من المصدر الفعلي.",
      tone: report.useMock ? "amber" : "slate",
      icon: Webhook,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              فحص Woo API
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-slate-950">
              هل الموقع يقرأ المنتجات والتصنيفات من المصدر الصحيح؟
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              هذا الجزء يوضح مصدر القراءة الحالي، وهل البيانات القادمة من Woo مناسبة
              للعرض داخل المتجر. استخدم “إعادة فحص Woo” بعد تعديل الرابط أو المفاتيح.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 border-slate-200 bg-white shadow-sm"
              onClick={() => void load()}
            >
              إعادة فحص Woo
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="shrink-0 border-slate-200 bg-white shadow-sm"
              onClick={copyJson}
            >
              {copied ? "تم النسخ" : "نسخ تقرير التشخيص"}
            </Button>
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
          title="مصدر البيانات"
          badge="قراءة"
          description="لو نوع القراءة «مباشرة»، فالواجهة تعتمد على Woo الحقيقي. لو «تجريبية»، راجع الرابط والمفاتيح."
        />
        <ControlMiniGuide
          title="اختبار المنتجات والتصنيفات"
          badge="API"
          description="الكروت التالية تقول هل Woo رد بنجاح وهل شكل البيانات مناسب للكود."
        />
        <ControlMiniGuide
          title="روابط النسخ"
          badge="Webhooks"
          description="انسخ روابط الاستقبال كما هي عند ضبط Woo أو أي نظام خارجي؛ لا تضيف مسارات عليها يدويًا."
        />
      </section>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          بيانات الربط الحالية
        </h2>
        <div className="mt-3 space-y-2 text-sm">
          <DataRow k="توقيت الفحص" v={new Date(report.at).toLocaleString("ar-EG")} />
          <DataRow k="نوع القراءة الحالية" v={report.useMock ? "تجريبية" : "مباشرة"} />
          <DataRow k="رابط مصدر المنتجات المستخدم الآن" v={report.wcBaseUrl ?? "—"} />
          <DataRow k="رابط المصدر المحفوظ داخل التحكم" v={cmsWooBaseUrl ?? "—"} />
          <DataRow k="رابط الموقع المحفوظ داخل التحكم" v={cmsPublicStorefrontBaseUrl ?? "—"} />
          <DataRow k="رابط مصدر إضافي" v={publicReadBaseUrl ?? "—"} />
          <DataRow k="رابط استقبال التحديثات" v={cmsExternalDataWebhookUrl ?? "—"} />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          يمكنك تعديل هذه الروابط من نموذج «روابط Woo والتكاملات» الموجود أعلى هذا الجزء.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ProbeCard
          title="اختبار قراءة المنتجات"
          description="يفحص عينة من المنتجات ويتأكد أن الاستجابة سليمة وأن الحقول الأساسية مفهومة."
          endpoint="Woo products endpoint"
          probe={report.products}
        />
        <ProbeCard
          title="اختبار قراءة التصنيفات"
          description="يتأكد أن التصنيفات التي تبني صفحات وأقسام المتجر يمكن قراءتها من Woo."
          endpoint="Woo categories endpoint"
          probe={report.categories}
        />
      </section>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          رابط التحديثات القادمة من Woo
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          هذا هو الرابط الذي تضعه داخل Woo حتى يعرف الموقع بوجود تحديث جديد في منتج أو تصنيف أو طلب.
        </p>
        <CopyableCode className="mt-3" value={webhookEndpointUrl} />
        <details className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 text-xs text-slate-600">
          <summary className="cursor-pointer font-medium text-slate-900">
            تفاصيل فنية إضافية
          </summary>
          <p className="mt-2">
            لو كنت تضبط الربط يدويًا، فالأحداث المفضلة عادة تكون الخاصة بالمنتجات والتصنيفات والطلبات.
          </p>
        </details>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          رابط استقبال التحديثات من نظام خارجي
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          لو عندك نظام آخر يرسل تحديثات للموقع، فهذا هو الرابط الذي تضعه هناك.
        </p>
        <p className="mt-2 text-xs text-slate-600">
          {cmsExternalDataWebhookUrl ? (
            <>
              الرابط أدناه محفوظ يدويًا داخل نموذج «روابط Woo والتكاملات».
            </>
          ) : (
            <>
              الرابط أدناه تم توليده تلقائيًا من رابط الموقع الحالي. إذا أردت كتابة رابط مخصص، احفظه من نموذج «روابط Woo والتكاملات».
            </>
          )}
        </p>
        <CopyableCode className="mt-3" value={externalDataWebhookUrl} />
        <details className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 text-xs text-slate-600">
          <summary className="cursor-pointer font-medium text-slate-900">
            تفاصيل فنية إضافية
          </summary>
          <p className="mt-2" dir="ltr">
            Header default: {EXTERNAL_DATA_WEBHOOK_SIGNATURE_HEADER_DEFAULT}
          </p>
        </details>
      </div>

      <WooWebhooksPanel />

      <WooWebhookDeliveriesPanel />

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3">
          <h2 className="font-display text-sm font-bold text-slate-900">مسارات الربط</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            هذا الجدول يوضح المسار الداخلي وما يقابله في المصدر الخارجي.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs text-slate-600">
                <th className="px-4 py-2.5 font-medium">الوحدة</th>
                <th className="px-4 py-2.5 font-medium">Next</th>
                <th className="px-4 py-2.5 font-medium">ريموت</th>
              </tr>
            </thead>
            <tbody>
              {report.apiMap.map((row) => (
                <tr
                  key={row.nextPath}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3 text-slate-800">{row.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">
                    {row.nextPath}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {row.remoteHint}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {process.env.NODE_ENV === "development" ? (
        <p className="text-center text-xs text-slate-500">
          <a
            className="font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
            href="/api/dev/woo-status"
            target="_blank"
            rel="noopener noreferrer"
          >
            فتح بيانات التشخيص الخام
          </a>
        </p>
      ) : null}
    </div>
  );
}
