"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { ControlFieldHelp } from "@/features/control/components/control-field-help";
import {
  cmsStorefrontIntegrationsSchema,
  type CmsSiteConfigDoc,
  type CmsStorefrontIntegrations,
} from "@/schemas/cms";

type Props = {
  initial: Partial<CmsStorefrontIntegrations> | undefined;
  disabled: boolean;
  onSave: (patch: Partial<CmsSiteConfigDoc>) => void;
};

/**
 * تكاملات علنية في Firestore (`site_config.storefrontIntegrations`).
 * أسرار Woo تبقى في بيئة الخادم (`WC_CONSUMER_*`).
 */
export function StorefrontIntegrationsForm({ initial, disabled, onSave }: Props) {
  const [wooBaseUrl, setWooBaseUrl] = useState(initial?.wooBaseUrl ?? "");
  const [publicStorefrontBaseUrl, setPublicStorefrontBaseUrl] = useState(
    initial?.publicStorefrontBaseUrl ?? "",
  );
  const [publicReadBaseUrl, setPublicReadBaseUrl] = useState(initial?.publicReadBaseUrl ?? "");
  const [externalDataWebhookUrl, setExternalDataWebhookUrl] = useState(
    initial?.externalDataWebhookUrl ?? "",
  );
  const [adminNote, setAdminNote] = useState(initial?.adminNote ?? "");

  useEffect(() => {
    setWooBaseUrl(initial?.wooBaseUrl ?? "");
    setPublicStorefrontBaseUrl(initial?.publicStorefrontBaseUrl ?? "");
    setPublicReadBaseUrl(initial?.publicReadBaseUrl ?? "");
    setExternalDataWebhookUrl(initial?.externalDataWebhookUrl ?? "");
    setAdminNote(initial?.adminNote ?? "");
  }, [initial]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const candidate: Partial<CmsStorefrontIntegrations> = {
      wooBaseUrl: wooBaseUrl.trim() || undefined,
      publicStorefrontBaseUrl: publicStorefrontBaseUrl.trim() || undefined,
      publicReadBaseUrl: publicReadBaseUrl.trim() || undefined,
      externalDataWebhookUrl: externalDataWebhookUrl.trim() || undefined,
      adminNote: adminNote.trim() || undefined,
    };
    const parsed = cmsStorefrontIntegrationsSchema.safeParse(candidate);
    if (!parsed.success) {
      toast.error(parsed.error.issues.map((i) => i.message).join(" — "));
      return;
    }
    onSave({ storefrontIntegrations: parsed.data });
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg font-bold">تكاملات المتجر (روابط التشغيل)</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        حقول HTTPS علنية فقط — لا تُخزَّن مفاتيح Woo هنا. بعد الحفظ راجع{" "}
        <Link
          href="/control?tab=health"
          className="font-medium text-emerald-700 underline underline-offset-2"
        >
          صحة الموقع والربط
        </Link>{" "}
        وأعد فحص Woo.
      </p>

      <div
        className="mt-4 rounded-xl border border-amber-200/90 bg-amber-50/60 p-4 text-sm text-amber-950"
        role="note"
      >
        <p className="font-semibold">أولوية مصدر منتجات Woo</p>
        <p className="mt-1 leading-relaxed">
          إذا كان متغير البيئة <span className="font-mono text-xs">WC_BASE_URL</span> مضبوطًا على الخادم
          (مثل Vercel)، فهو يُستخدم أولًا وتُتجاهل قيمة «رابط مصدر Woo» المحفوظة هنا. لتعتمد القيمة من هذا
          النموذج، احذف أو لا تضبط <span className="font-mono text-xs">WC_BASE_URL</span> في إعدادات النشر.
        </p>
        <p className="mt-2 leading-relaxed">
          عند تغيير موقع Woo حدّث أيضًا{" "}
          <span className="font-mono text-xs">WC_CONSUMER_KEY</span> و{" "}
          <span className="font-mono text-xs">WC_CONSUMER_SECRET</span> في نفس البيئة لتطابق الموقع الجديد.
        </p>
      </div>

      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={(e) => void submit(e)}>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">رابط مصدر Woo (WordPress / WooCommerce)</label>
          <ControlFieldHelp>
            أصل HTTPS فقط، مثل https://shop.example.com — بدون مسار /wp-json. يُستخدم لطلبات REST على السيرفر
            عندما لا يوجد WC_BASE_URL في البيئة.
          </ControlFieldHelp>
          <input
            type="url"
            name="wooBaseUrl"
            value={wooBaseUrl}
            onChange={(e) => setWooBaseUrl(e.target.value)}
            placeholder="https://..."
            autoComplete="off"
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium">نطاق واجهة المتجر العلنية (ويبهوك)</label>
          <ControlFieldHelp>
            اختياري — يُبنى منه عنوان استقبال الويبهوك بدل NEXT_PUBLIC_SITE_URL عند ضبط القيمة.
          </ControlFieldHelp>
          <input
            type="url"
            name="publicStorefrontBaseUrl"
            value={publicStorefrontBaseUrl}
            onChange={(e) => setPublicStorefrontBaseUrl(e.target.value)}
            placeholder="https://متجرك.app"
            autoComplete="off"
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium">رابط مصدر قراءة إضافي (اختياري)</label>
          <ControlFieldHelp>يُعرض في الإعدادات العامة والملخصات عند الحاجة لمصدر علني منفصل.</ControlFieldHelp>
          <input
            type="url"
            name="publicReadBaseUrl"
            value={publicReadBaseUrl}
            onChange={(e) => setPublicReadBaseUrl(e.target.value)}
            placeholder="https://..."
            autoComplete="off"
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium">رابط استقبال البيانات الخارجية (عرض / نسخ)</label>
          <ControlFieldHelp>
            HTTPS كامل لـ POST ويبهوك البيانات الخارجي — السر يبقى في EXTERNAL_DATA_WEBHOOK_SECRET بالبيئة.
          </ControlFieldHelp>
          <input
            type="url"
            name="externalDataWebhookUrl"
            value={externalDataWebhookUrl}
            onChange={(e) => setExternalDataWebhookUrl(e.target.value)}
            placeholder="https://..."
            autoComplete="off"
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium">ملاحظة داخلية (لا تُعرض للعميل)</label>
          <textarea
            name="adminNote"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={2}
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="submit" disabled={disabled}>
            {disabled ? "جاري الحفظ…" : "حفظ تكاملات المتجر"}
          </Button>
          <Link
            href="/control?tab=health"
            className="text-sm font-medium text-emerald-700 underline underline-offset-2"
          >
            فتح صحة الربط والتشخيص
          </Link>
        </div>
      </form>
    </section>
  );
}
