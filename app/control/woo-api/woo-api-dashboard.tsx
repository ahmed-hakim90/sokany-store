"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { DatabaseZap, PackageSearch, Radar, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ControlMiniGuide,
  ControlSectionIntro,
  ControlStatCard,
} from "@/features/control/components/control-page-chrome";
import type { WooDiagnosticReport } from "@/lib/woo-diagnostics";
import { EXTERNAL_DATA_WEBHOOK_SIGNATURE_HEADER_DEFAULT } from "@/lib/external-data-webhook-constants";
import { cn } from "@/lib/utils";
import { WooWebhookDeliveriesPanel } from "./woo-webhook-deliveries-panel";
import { WooWebhooksPanel } from "./woo-webhooks-panel";

function StatusPill({
  ok,
  label,
}: {
  ok: boolean;
  label: string;
}) {
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
  endpoint,
  probe,
}: {
  title: string;
  endpoint: string;
  probe: WooDiagnosticReport["products"];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3">
        <h2 className="font-display text-sm font-bold text-slate-900">{title}</h2>
        <p className="mt-0.5 font-mono text-[11px] text-slate-500">{endpoint}</p>
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

export function WooApiDashboard({
  report,
  publicReadBaseUrl,
  cmsWooBaseUrl,
  cmsPublicStorefrontBaseUrl,
  cmsExternalDataWebhookUrl,
  webhookEndpointUrl,
  externalDataWebhookUrl,
}: {
  report: WooDiagnosticReport;
  publicReadBaseUrl: string | null;
  /** من «عام — تكاملات» — أصل Woo الاختياري في CMS. */
  cmsWooBaseUrl: string | null;
  /** من CMS — نطاق واجهة نيكست لعناوين الويبهوك. */
  cmsPublicStorefrontBaseUrl: string | null;
  /** إن وُضع في «عام — تكاملات» — وإلا `null`. */
  cmsExternalDataWebhookUrl: string | null;
  webhookEndpointUrl: string;
  /** من CMS إن وُجد، وإلا مُشتق تلقائياً من النطاق. */
  externalDataWebhookUrl: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [copiedHook, setCopiedHook] = useState(false);
  const [copiedExternalHook, setCopiedExternalHook] = useState(false);

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
    <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            متابعة الربط
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            ربط المنتجات والتحديثات
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            راجع من هنا هل قراءة المنتجات والتصنيفات تعمل بشكل سليم، وخذ الروابط التي تحتاجها لأي ربط خارجي أو تحديث تلقائي.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 border-slate-200 bg-white shadow-sm"
            onClick={() => router.refresh()}
          >
            إعادة الفحص
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 border-slate-200 bg-white shadow-sm"
            onClick={copyJson}
          >
            {copied ? "تم النسخ" : "نسخ ملخص الحالة"}
          </Button>
          <Link
            href="/control/dev"
            className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 px-4 text-sm font-medium text-indigo-800 shadow-sm transition-colors hover:bg-indigo-100/80"
          >
            متابعة الحالة
          </Link>
          <Link
            href="/control"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-surface-muted"
          >
            رجوع للوحة
          </Link>
        </div>
      </div>

      <div className="mb-6 space-y-6">
        <ControlSectionIntro
          eyebrow="فهم الصفحة"
          title="مراجعة الربط ونسخ الروابط المهمة"
          description="ابدأ من حالة المنتجات والتصنيفات، ثم انسخ روابط التحديثات الجاهزة، وبعدها راجع التفاصيل فقط لو ظهر خلل."
          bullets={[
            "اعرف هل الربط سليم",
            "انسخ الرابط الصحيح",
            "راجع التفاصيل عند الحاجة فقط",
          ]}
          tone="brand"
          icon={DatabaseZap}
        />

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
            title="لو كل شيء سليم"
            badge="طمأنة"
            description="هذا يعني أن الموقع يقرأ المنتجات بشكل طبيعي ويمكنك الاكتفاء بالمتابعة الدورية فقط."
          />
          <ControlMiniGuide
            title="لو الرابط خطأ"
            badge="مراجعة"
            description="راجع روابط الربط في الإعدادات العامة وتأكد أن رابط المصدر الفعلي هو نفسه المستخدم الآن."
          />
          <ControlMiniGuide
            title="لو شكل البيانات فيه مشكلة"
            badge="فحص"
            description="ستظهر ملاحظات أسفل بطاقات الفحص لتوضح أي جزء قادم من المصدر يحتاج ضبط أو مراجعة."
          />
        </section>
      </div>

      <div className="mb-8 overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
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
          يمكنك تعديل هذه الروابط من{" "}
          <Link
            href="/control?tab=general"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            تبويب «عام»
          </Link>
          .
        </p>
      </div>

      <div className="mb-8 overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          رابط التحديثات القادمة من Woo
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          هذا هو الرابط الذي تضعه داخل Woo حتى يعرف الموقع بوجود تحديث جديد في منتج أو تصنيف أو طلب.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <code className="block min-w-0 break-all rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-800 ltr" dir="ltr">
            {webhookEndpointUrl}
          </code>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 border-slate-200 bg-white text-sm shadow-sm"
            onClick={() => {
              void navigator.clipboard.writeText(webhookEndpointUrl);
              setCopiedHook(true);
              setTimeout(() => setCopiedHook(false), 2000);
            }}
          >
            {copiedHook ? "تم" : "نسخ الرابط"}
          </Button>
        </div>
        <details className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 text-xs text-slate-600">
          <summary className="cursor-pointer font-medium text-slate-900">
            تفاصيل فنية إضافية
          </summary>
          <p className="mt-2">
            لو كنت تضبط الربط يدويًا، فالأحداث المفضلة عادة تكون الخاصة بالمنتجات والتصنيفات والطلبات.
          </p>
        </details>
      </div>

      <div className="mb-8 overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          رابط استقبال التحديثات من نظام خارجي
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          لو عندك نظام آخر يرسل تحديثات للموقع، فهذا هو الرابط الذي تضعه هناك.
        </p>
        <p className="mt-2 text-xs text-slate-600">
          {cmsExternalDataWebhookUrl ? (
            <>
              الرابط أدناه محفوظ يدويًا داخل{" "}
              <Link
                href="/control?tab=general"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                تبويب «عام»
              </Link>
              .
            </>
          ) : (
            <>
              الرابط أدناه تم توليده تلقائيًا من رابط الموقع الحالي. إذا أردت كتابة رابط مخصص، احفظه من{" "}
              <Link
                href="/control?tab=general"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                تبويب «عام»
              </Link>.
            </>
          )}
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <code
            className="block min-w-0 break-all rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-800 ltr"
            dir="ltr"
          >
            {externalDataWebhookUrl}
          </code>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 border-slate-200 bg-white text-sm shadow-sm"
            onClick={() => {
              void navigator.clipboard.writeText(externalDataWebhookUrl);
              setCopiedExternalHook(true);
              setTimeout(() => setCopiedExternalHook(false), 2000);
            }}
          >
            {copiedExternalHook ? "تم" : "نسخ الرابط"}
          </Button>
        </div>
        <details className="mt-3 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 text-xs text-slate-600">
          <summary className="cursor-pointer font-medium text-slate-900">
            تفاصيل فنية إضافية
          </summary>
          <p className="mt-2" dir="ltr">
            Header default: {EXTERNAL_DATA_WEBHOOK_SIGNATURE_HEADER_DEFAULT}
          </p>
        </details>
      </div>

      <div className="mb-8">
        <WooWebhooksPanel />
      </div>

      <div className="mb-8">
        <WooWebhookDeliveriesPanel />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <ProbeCard
          title="المنتجات"
          endpoint="فحص قراءة المنتجات"
          probe={report.products}
        />
        <ProbeCard
          title="التصنيفات"
          endpoint="فحص قراءة التصنيفات"
          probe={report.categories}
        />
      </div>

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
        <p className="mt-6 text-center text-xs text-slate-500">
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
