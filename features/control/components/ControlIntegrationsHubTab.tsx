"use client";

import { ControlHealthTab } from "@/features/control/components/ControlHealthTab";
import { ControlWooApiTab } from "@/features/control/components/ControlWooApiTab";
import { OrderForwardingSettingsTab } from "@/features/control/components/OrderForwardingSettingsTab";
import { StorefrontIntegrationsForm } from "@/features/control/components/StorefrontIntegrationsForm";
import type { CmsSiteConfigDoc, CmsStorefrontIntegrations } from "@/schemas/cms";

type Props = {
  initialIntegrations: Partial<CmsStorefrontIntegrations> | undefined;
  disabled: boolean;
  onSaveIntegrations: (patch: Partial<CmsSiteConfigDoc>) => void;
};

function IntegrationStatusCard({
  title,
  value,
  description,
  tone = "slate",
}: {
  title: string;
  value: string;
  description: string;
  tone?: "emerald" | "amber" | "slate";
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50/70 text-amber-950"
        : "border-slate-200 bg-white text-slate-950";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
        {title}
      </p>
      <p className="mt-2 font-display text-xl font-bold">{value}</p>
      <p className="mt-2 text-sm leading-6 opacity-80">{description}</p>
    </div>
  );
}

export function ControlIntegrationsHubTab({
  initialIntegrations,
  disabled,
  onSaveIntegrations,
}: Props) {
  const hasWooUrl = Boolean(initialIntegrations?.wooBaseUrl?.trim());
  const hasStorefrontUrl = Boolean(initialIntegrations?.publicStorefrontBaseUrl?.trim());
  const hasExternalWebhook = Boolean(initialIntegrations?.externalDataWebhookUrl?.trim());

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_38%),linear-gradient(135deg,#ffffff,#f8fafc)] p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
            مركز الربط
          </p>
          <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-start">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950">
                Woo والطلبات وصحة الربط
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                الصفحة دي معمولة عشان تعرف بسرعة هل المتجر متصل بـ Woo، هل التحديثات
                التلقائية بتوصل، وهل الطلبات بتخرج لأي نظام خارجي بشكل صحيح. ابدأ من
                الملخص، وبعدها استخدم الأزرار الموجودة في كل جزء للفحص أو الإصلاح.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-950">
              <p className="font-semibold">اقرأها كالتالي</p>
              <p className="mt-1">
                الأخضر يعني الربط شغال. الأصفر يعني فيه خطوة محتاجة مراجعة. الأحمر
                يعني فيه فشل واضح ويبدأ الإصلاح من الكارت الذي ظهر فيه التحذير.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 border-t border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-3">
          <IntegrationStatusCard
            title="مصدر Woo"
            value={hasWooUrl ? "رابط محفوظ" : "يعتمد على الخادم"}
            description={
              hasWooUrl
                ? "يوجد رابط Woo محفوظ داخل لوحة التحكم، مع استمرار أولوية إعدادات الخادم عند وجودها."
                : "لو متغيرات الخادم مضبوطة، سيستخدمها الموقع حتى لو الحقل هنا فارغ."
            }
            tone={hasWooUrl ? "emerald" : "amber"}
          />
          <IntegrationStatusCard
            title="رابط المتجر"
            value={hasStorefrontUrl ? "جاهز للويبهوك" : "يتولد تلقائيًا"}
            description="هذا الرابط يُستخدم لبناء روابط استقبال التحديثات التي تضبط داخل Woo أو الأنظمة الخارجية."
            tone={hasStorefrontUrl ? "emerald" : "slate"}
          />
          <IntegrationStatusCard
            title="بيانات خارجية"
            value={hasExternalWebhook ? "رابط مخصص" : "اختياري"}
            description="استخدمه فقط لو فيه نظام خارجي غير Woo يرسل تحديثات للموقع."
            tone={hasExternalWebhook ? "emerald" : "slate"}
          />
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="control-health-system">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            الخطوة 1
          </p>
          <h2 id="control-health-system" className="font-display text-lg font-bold text-slate-900">
            حالة الربط الآن
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            هنا يظهر ملخص الصحة والاختبارات السريعة: جرّب تحديثًا، حدّث الكاش، أو افحص شكل بيانات منتج عشوائي.
          </p>
        </div>
        <ControlHealthTab />
      </section>

      <section className="space-y-3 border-t border-border pt-8" aria-labelledby="control-health-woo">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            الخطوة 2
          </p>
          <h2 id="control-health-woo" className="font-display text-lg font-bold text-slate-900">
            إعدادات Woo والروابط المهمة
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            اضبط مصدر البيانات ومفاتيح Woo، ثم راجع الفحص التفصيلي وروابط النسخ الخاصة بالتحديثات التلقائية.
          </p>
        </div>
        <StorefrontIntegrationsForm
          initial={initialIntegrations}
          disabled={disabled}
          onSave={onSaveIntegrations}
        />
        <ControlWooApiTab />
      </section>
      <section
        className="space-y-3 border-t border-border pt-8"
        aria-labelledby="control-health-forwarding"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            الخطوة 3
          </p>
          <h2 id="control-health-forwarding" className="font-display text-lg font-bold text-slate-900">
            الطلبات والتكامل الخارجي
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            فعّل هذا الجزء فقط لو الطلبات لازم تروح لنظام آخر بجانب المتجر، مثل CRM أو ERP أو لوحة تشغيل داخلية.
          </p>
        </div>
        <OrderForwardingSettingsTab />
      </section>
    </div>
  );
}
