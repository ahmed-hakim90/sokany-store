"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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

type WooCredentialsStatus = {
  hasConsumerKey: boolean;
  hasConsumerSecret: boolean;
  consumerKeyDisplay: string | null;
  source: "env" | "firestore" | null;
  encryptedCredentialsSaved: boolean;
  encryptionConfigured: boolean;
};

function controlApiErrorMessage(value: unknown, fallback: string) {
  if (value && typeof value === "object" && "error" in value) {
    const err = (value as { error: unknown }).error;
    if (typeof err === "string") return err;
    if (err && typeof err === "object") return "راجع صيغة المفاتيح المدخلة";
  }
  return fallback;
}

/**
 * تكاملات Firestore: الروابط داخل `site_config`، وأسرار Woo في وثيقة مشفرة منفصلة.
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
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");
  const [credentialStatus, setCredentialStatus] = useState<WooCredentialsStatus | null>(null);
  const [credentialsSaving, setCredentialsSaving] = useState(false);

  useEffect(() => {
    setWooBaseUrl(initial?.wooBaseUrl ?? "");
    setPublicStorefrontBaseUrl(initial?.publicStorefrontBaseUrl ?? "");
    setPublicReadBaseUrl(initial?.publicReadBaseUrl ?? "");
    setExternalDataWebhookUrl(initial?.externalDataWebhookUrl ?? "");
    setAdminNote(initial?.adminNote ?? "");
  }, [initial]);

  const loadCredentialStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/control/woocommerce/credentials", {
        credentials: "include",
      });
      const data = (await res.json()) as unknown;
      if (res.ok && data && typeof data === "object") {
        setCredentialStatus(data as WooCredentialsStatus);
      }
    } catch {
      /* الحالة اختيارية داخل النموذج؛ تبويب الصحة يعرض التشخيص الكامل. */
    }
  }, []);

  useEffect(() => {
    void loadCredentialStatus();
  }, [loadCredentialStatus]);

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

  async function submitWooCredentials(e: React.FormEvent) {
    e.preventDefault();
    const key = consumerKey.trim();
    const secret = consumerSecret.trim();
    if (!/^ck_[A-Za-z0-9]+$/.test(key) || !/^cs_[A-Za-z0-9]+$/.test(secret)) {
      toast.error("تأكد أن المفتاح يبدأ بـ ck_ والسر يبدأ بـ cs_ بدون مسافات");
      return;
    }
    setCredentialsSaving(true);
    try {
      const res = await fetch("/api/control/woocommerce/credentials", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consumerKey: key, consumerSecret: secret }),
      });
      const data = (await res.json()) as { credentials?: WooCredentialsStatus } | unknown;
      if (!res.ok) {
        throw new Error(controlApiErrorMessage(data, "فشل حفظ مفاتيح Woo"));
      }
      if (data && typeof data === "object" && "credentials" in data) {
        setCredentialStatus((data as { credentials: WooCredentialsStatus }).credentials);
      } else {
        await loadCredentialStatus();
      }
      setConsumerKey("");
      setConsumerSecret("");
      toast.success("تم حفظ مفاتيح Woo المشفرة");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل حفظ مفاتيح Woo");
    } finally {
      setCredentialsSaving(false);
    }
  }

  const credentialSourceLabel =
    credentialStatus?.source === "env"
      ? "متغيرات البيئة"
      : credentialStatus?.source === "firestore"
        ? "Firestore مشفر"
        : "غير مضبوط";

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            إعدادات المصدر
          </p>
          <h2 className="mt-1 font-display text-lg font-bold">روابط Woo والتكاملات</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            هنا تحدد من أين يقرأ الموقع المنتجات والتصنيفات، وأي رابط يستخدمه Woo أو الأنظمة الخارجية لإرسال التحديثات.
            بعد أي تعديل احفظ ثم شغّل فحص Woo من نفس الصفحة.
          </p>
        </div>
        <Link
          href="/control?tab=health"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100"
        >
          فتح فحص الربط
        </Link>
      </div>

      <div
        className="mt-4 rounded-xl border border-amber-200/90 bg-amber-50/60 p-4 text-sm text-amber-950"
        role="note"
      >
        <p className="font-semibold">أهم قاعدة قبل التعديل</p>
        <p className="mt-1 leading-relaxed">
          لو <span className="font-mono text-xs">WC_BASE_URL</span> موجود على الخادم، سيأخذ الأولوية
          على رابط Woo المحفوظ هنا. لذلك قد ترى رابطًا محفوظًا، لكن الفحص يستخدم قيمة الخادم.
        </p>
        <p className="mt-2 leading-relaxed">
          مفاتيح Woo يمكن أن تأتي من <span className="font-mono text-xs">WC_CONSUMER_*</span> في البيئة
          أو من التخزين المشفر. مفاتيح البيئة لها الأولوية أيضًا.
        </p>
      </div>

      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={(e) => void submit(e)}>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">رابط Woo الأساسي</label>
          <ControlFieldHelp>
            رابط متجر Woo نفسه فقط، مثال: https://shop.example.com بدون /wp-json. منه يقرأ الموقع المنتجات والتصنيفات.
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
          <label className="text-sm font-medium">رابط المتجر العلني</label>
          <ControlFieldHelp>
            الرابط العلني لتطبيق سوكاني. نستخدمه لبناء رابط استقبال Webhooks الذي تضعه داخل Woo.
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
          <label className="text-sm font-medium">رابط قراءة إضافي (اختياري)</label>
          <ControlFieldHelp>
            اتركه فارغًا إلا إذا عندك مصدر قراءة علني منفصل عن رابط Woo الأساسي.
          </ControlFieldHelp>
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
          <label className="text-sm font-medium">رابط استقبال بيانات خارجية</label>
          <ControlFieldHelp>
            رابط كامل فقط لو فيه سيرفر خارجي غير Woo سيرسل تحديثات للموقع. السر يفضل ضبطه على الخادم.
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
          <p className="text-xs leading-5 text-muted-foreground">
            بعد الحفظ استخدم “إعادة فحص Woo” للتأكد أن الرابط المستخدم فعليًا هو المتوقع.
          </p>
        </div>
      </form>

      <form
        className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
        onSubmit={(e) => void submitWooCredentials(e)}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-bold">مفاتيح Woo المشفرة</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              هذه المفاتيح تسمح للموقع بقراءة Woo. الحفظ مسموح للمشرف الرئيسي فقط، والمفاتيح لا تظهر مرة أخرى بعد الحفظ.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
            <p>
              المصدر الحالي: <span className="font-semibold">{credentialSourceLabel}</span>
            </p>
            <p className="mt-1 font-mono">
              {credentialStatus?.consumerKeyDisplay ?? "ck_ غير مضبوط"}
            </p>
          </div>
        </div>

        {credentialStatus && !credentialStatus.encryptionConfigured ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            أضف <span className="font-mono text-xs">WOO_CREDENTIALS_ENCRYPTION_KEY</span> على الخادم
            قبل حفظ المفاتيح من اللوحة.
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Consumer Key</label>
            <input
              type="password"
              value={consumerKey}
              onChange={(e) => setConsumerKey(e.target.value)}
              placeholder="ck_..."
              autoComplete="off"
              disabled={disabled || credentialsSaving}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Consumer Secret</label>
            <input
              type="password"
              value={consumerSecret}
              onChange={(e) => setConsumerSecret(e.target.value)}
              placeholder="cs_..."
              autoComplete="off"
              disabled={disabled || credentialsSaving}
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 font-mono text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={disabled || credentialsSaving || credentialStatus?.encryptionConfigured === false}
          >
            {credentialsSaving ? "جاري حفظ المفاتيح…" : "حفظ مفاتيح Woo المشفرة"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={credentialsSaving}
            onClick={() => void loadCredentialStatus()}
          >
            تحديث حالة المفاتيح
          </Button>
          <p className="text-xs text-muted-foreground">
            {credentialStatus?.encryptedCredentialsSaved
              ? "يوجد زوج مفاتيح محفوظ ومشفر."
              : credentialStatus
                ? "لا يوجد زوج مفاتيح محفوظ في Firestore بعد."
                : "جاري قراءة حالة المفاتيح..."}
          </p>
        </div>
      </form>
    </section>
  );
}
