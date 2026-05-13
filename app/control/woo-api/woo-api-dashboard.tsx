"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
            <StatusPill ok={probe.ok} label={`HTTP ${probe.httpStatus}`} />
          ) : (
            <span className="text-xs text-slate-500">— HTTP</span>
          )}
          <StatusPill
            ok={probe.schemaOk}
            label={probe.schemaOk ? "Schema OK" : "Schema غير مطابق"}
          />
          <span className="text-xs text-slate-500">
            عيّنات: {probe.sampleCount}
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
              عيّنة أول سجل
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

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Developers
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Woo &amp; API
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            حالة الاتصال بـ WooCommerce، توافق الـ schema، وعيّنات آمنة — بنفس أسلوب لوحات
            الـ SaaS (بطاقات واضحة، حدود خفيفة).
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
            {copied ? "تم النسخ" : "نسخ JSON كامل"}
          </Button>
          <Link
            href="/control/dev"
            className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 px-4 text-sm font-medium text-indigo-800 shadow-sm transition-colors hover:bg-indigo-100/80"
          >
            Site health
          </Link>
          <Link
            href="/control"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-white px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-surface-muted"
          >
            رجوع للوحة
          </Link>
        </div>
      </div>

      <div className="mb-8 overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          البيئة
        </h2>
        <div className="mt-3 space-y-2 text-sm">
          <DataRow k="توقيت الفحص" v={new Date(report.at).toLocaleString("ar-EG")} />
          <DataRow k="NEXT_PUBLIC_USE_MOCK" v={String(report.useMock)} />
          <DataRow k="Woo مُكوّن (WC_*)" v={String(report.wooEnvConfigured)} />
          <DataRow
            k="أصل Woo (فعلي — من CMS أو env)"
            v={report.wcBaseUrl ?? "—"}
          />
          <DataRow
            k="wooBaseUrl (حقل CMS فقط)"
            v={cmsWooBaseUrl ?? "—"}
          />
          <DataRow
            k="publicStorefrontBaseUrl (من CMS)"
            v={cmsPublicStorefrontBaseUrl ?? "—"}
          />
          <DataRow
            k="publicReadBaseUrl (من CMS)"
            v={publicReadBaseUrl ?? "—"}
          />
          <DataRow
            k="externalDataWebhookUrl (من CMS)"
            v={cmsExternalDataWebhookUrl ?? "—"}
          />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          تعديل <code className="rounded bg-slate-100 px-1 font-mono">publicReadBaseUrl</code> و
          <code className="mx-1 rounded bg-slate-100 px-1 font-mono">externalDataWebhookUrl</code>{" "}
          من{" "}
          <Link
            href="/control?tab=general"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            تبويب «عام» — تكاملات
          </Link>
          . المفاتيح السرية في env فقط.
        </p>
      </div>

      <div className="mb-8 overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Webhook — تحديث سعر / كمية / منتج / تصنيف
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          وُهندَس الـ Webhook: عند وصول حدث موقّع من ووردبريس، يُبطَّل كاش المنتجات
          ووسوم السايت-ماب ويُعاد توليد صفحات الكتالوج. انسخ الرابط في Woo →
          <strong className="text-slate-900"> الإعدادات → متقدم → Webhooks</strong>،
          وضع نفس <code className="rounded bg-slate-100 px-1">WC_WEBHOOK_SECRET</code>{" "}
          الـ Secret في الـ env وفي الـ Webhook.
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
        <p className="mt-3 text-xs text-slate-500">
          <strong>مواضيع مُوصى بها:</strong>{" "}
          <span dir="ltr" className="font-mono">product.created</span>،
          <span className="mx-1" />
          <span dir="ltr" className="font-mono">product.updated</span>،
          <span className="mx-1" />
          <span dir="ltr" className="font-mono">product.deleted</span>،
          <span className="mx-1" />
          <span dir="ltr" className="font-mono">product.restored</span> — وللأقسام:{" "}
          <span dir="ltr" className="font-mono">product_cat.*</span>، وطلبات: <span dir="ltr" className="font-mono">order.*</span>.{" "}
          (يمكنك أيضاً إنشاءها تلقائياً من القسم أدناه). التوصيل: <strong>Title</strong> اختياري.
        </p>
      </div>

      <div className="mb-8 overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Webhook — API / سيرفر خارجي (HMAC على الجسم)
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          لربط <strong className="text-slate-900">السيرفر التاني</strong> أو مصدر بيانات يدفع
          عند تغيّر الكتالوج: أرسل <code className="rounded bg-slate-100 px-1" dir="ltr">POST</code>{" "}
          بجسم خام (مثلاً JSON)، ووضع توقيع ‎<strong>Base64(HMAC-SHA256(rawBody, secret))</strong>{" "}
          في الهيدر — مثل منطق Woo. اضبط <code className="rounded bg-slate-100 px-1" dir="ltr">EXTERNAL_DATA_WEBHOOK_SECRET</code>{" "}
          في الـ env على الطرفين؛ (اختياري) اسم الهيدر عبر{" "}
          <code className="rounded bg-slate-100 px-1" dir="ltr">EXTERNAL_DATA_WEBHOOK_HEADER</code>{" "}
          (الافتراضي: <span dir="ltr" className="font-mono text-xs">{EXTERNAL_DATA_WEBHOOK_SIGNATURE_HEADER_DEFAULT}</span>).
        </p>
        <p className="mt-2 text-xs text-slate-600">
          {cmsExternalDataWebhookUrl ? (
            <>
              الرابط أدناه <strong className="text-slate-800">من</strong> حقل{" "}
              <code className="rounded bg-slate-100 px-1 font-mono text-[11px]" dir="ltr">
                externalDataWebhookUrl
              </code>{" "}
              في{" "}
              <Link
                href="/control?tab=general"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                تبويب «عام» — تكاملات
              </Link>
              .
            </>
          ) : (
            <>
              الرابط أدناه <strong className="text-slate-800">مُشتق تلقائياً</strong> من نطاق
              الستور؛ لعرض رابط تكتبه بنفسك احفظه في{" "}
              <Link
                href="/control?tab=general"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                تبويب «عام» — تكاملات
              </Link>{" "}
              (<code className="rounded bg-slate-100 px-1 font-mono text-[11px]" dir="ltr">
                externalDataWebhookUrl
              </code>
              ).
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
        <p className="mt-3 text-xs text-slate-500" dir="ltr">
          <span className="text-slate-600">مثال للطرف المُرسل (قيمة الهيدر = ناتج HMAC بصيغة Base64): </span>
          <br />
          <code className="text-[11px] break-all">
            {EXTERNAL_DATA_WEBHOOK_SIGNATURE_HEADER_DEFAULT}: [base64 from HMAC-SHA256 of raw body bytes]
          </code>
        </p>
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
          endpoint="GET …/wc/v3/products?per_page=1"
          probe={report.products}
        />
        <ProbeCard
          title="التصنيفات"
          endpoint="GET …/wc/v3/products/categories?per_page=1"
          probe={report.categories}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3">
          <h2 className="font-display text-sm font-bold text-slate-900">خريطة الـ API</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            مسار Next → تلميح المورد الريموت
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
            فتح الاستجابة JSON الخام
          </a>
        </p>
      ) : null}
    </div>
  );
}
