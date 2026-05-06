"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { ControlFieldHelp } from "@/features/control/components/control-field-help";
import {
  ControlAdvancedDetails,
  ControlFormSection,
} from "@/features/control/components/control-page-chrome";
import { formatControlApiError } from "@/features/control/lib/control-cms-put";
import {
  DEFAULT_ORDER_FORWARDING_SECRET_HEADER_NAME,
  type OrderForwardingSettingsPublic,
} from "@/schemas/order-forwarding";

const EMPTY_SETTINGS: OrderForwardingSettingsPublic = {
  enabled: false,
  secretHeaderName: DEFAULT_ORDER_FORWARDING_SECRET_HEADER_NAME,
  hasSecret: false,
};

function generateSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const raw = String.fromCharCode(...bytes);
  return btoa(raw).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function OrderForwardingSettingsTab() {
  const router = useRouter();
  const [settings, setSettings] =
    useState<OrderForwardingSettingsPublic>(EMPTY_SETTINGS);
  const [apiUrl, setApiUrl] = useState("");
  const [secretHeaderName, setSecretHeaderName] = useState<string>(
    DEFAULT_ORDER_FORWARDING_SECRET_HEADER_NAME,
  );
  const [enabled, setEnabled] = useState(false);
  const [secret, setSecret] = useState("");
  const [clearSecret, setClearSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const applySettings = useCallback((next: OrderForwardingSettingsPublic) => {
    setSettings(next);
    setEnabled(next.enabled);
    setApiUrl(next.apiUrl ?? "");
    setSecretHeaderName(
      next.secretHeaderName || DEFAULT_ORDER_FORWARDING_SECRET_HEADER_NAME,
    );
    setSecret("");
    setClearSecret(false);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/control/order-forwarding-settings", {
        credentials: "include",
      });
      if (res.status === 401) {
        router.replace("/control/login");
        return;
      }
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: unknown };
        throw new Error(formatControlApiError(payload));
      }
      applySettings((await res.json()) as OrderForwardingSettingsPublic);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذر تحميل إعدادات التكامل");
    } finally {
      setLoading(false);
    }
  }, [applySettings, router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/control/order-forwarding-settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          apiUrl,
          secretHeaderName,
          secret,
          clearSecret,
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: unknown };
        throw new Error(formatControlApiError(payload));
      }
      applySettings((await res.json()) as OrderForwardingSettingsPublic);
      toast.success("تم حفظ تكامل الطلبات");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">جاري تحميل إعدادات تكامل الطلبات…</p>
      </section>
    );
  }

  return (
    <ControlFormSection
      title="إرسال الطلبات لجهة خارجية"
      description="استخدم هذا القسم لو عندك نظام خارجي يحتاج يستقبل نسخة من كل طلب جديد بعد نجاحه في المتجر."
    >
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span>تشغيل الإرسال التلقائي للطلبات</span>
        </label>
        <div className="sm:col-span-2 -mt-2">
          <ControlFieldHelp>
            فعّل الاختيار ده لو عايز كل طلب جديد يروح كمان لنظام خارجي عندك.
          </ControlFieldHelp>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="order-forwarding-api-url">
            رابط الجهة المستقبلة
          </label>
          <ControlFieldHelp>
            حط هنا رابط النظام الخارجي اللي هيستقبل بيانات الطلب بعد ما العميل يكمّل الشراء.
          </ControlFieldHelp>
          <input
            id="order-forwarding-api-url"
            type="url"
            inputMode="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://api.example.com/orders"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm ltr"
            dir="ltr"
            autoComplete="off"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="order-forwarding-secret">
            مفتاح الحماية
          </label>
          <ControlFieldHelp>
            هذا المفتاح بين الموقع والنظام الخارجي للتأكد أن الطلب المرسل حقيقي وجاي من عندك.
          </ControlFieldHelp>
          <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <input
              id="order-forwarding-secret"
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder={settings.hasSecret ? "اتركه فارغًا للحفاظ على المفتاح الحالي" : "أنشئ مفتاحًا أو اكتب واحدًا"}
              className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2 font-mono text-sm ltr"
              dir="ltr"
              autoComplete="off"
            />
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => {
                setSecret(generateSecret());
                setClearSecret(false);
              }}
            >
              إنشاء مفتاح
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            الحالة الحالية: {settings.hasSecret ? "يوجد مفتاح محفوظ" : "لا يوجد مفتاح محفوظ"}.
            بعد إنشاء مفتاح جديد اضغط حفظ لتفعيله.
          </p>
        </div>

        <div className="sm:col-span-2">
          <ControlAdvancedDetails summary="إعدادات متقدمة">
            <div>
              <label className="text-sm font-medium" htmlFor="order-forwarding-header">
                اسم خانة الأمان
              </label>
              <ControlFieldHelp>
                غيّره فقط لو النظام الخارجي طلب اسمًا معينًا للمفتاح. لو غير متأكد، اتركه كما هو.
              </ControlFieldHelp>
              <input
                id="order-forwarding-header"
                value={secretHeaderName}
                onChange={(e) => setSecretHeaderName(e.target.value)}
                placeholder={DEFAULT_ORDER_FORWARDING_SECRET_HEADER_NAME}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm ltr"
                dir="ltr"
                autoComplete="off"
              />
            </div>

            {settings.hasSecret ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={clearSecret}
                  onChange={(e) => setClearSecret(e.target.checked)}
                />
                <span>مسح المفتاح الحالي عند الحفظ</span>
              </label>
            ) : null}
          </ControlAdvancedDetails>
        </div>

        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" disabled={saving}>
            {saving ? "جاري الحفظ…" : "حفظ إعدادات التكامل"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={() => applySettings(settings)}
          >
            إلغاء التغييرات
          </Button>
        </div>
      </form>
    </ControlFormSection>
  );
}
