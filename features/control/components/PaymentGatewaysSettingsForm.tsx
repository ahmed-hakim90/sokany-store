"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { ControlFieldHelp } from "@/features/control/components/control-field-help";

type GatewayStatus = {
  enabled: boolean;
  source?: "env" | "firestore";
};

type FawryStatus = GatewayStatus & {
  merchantCode?: string;
  secureKey?: string;
  sandbox?: boolean;
};

type PaymobStatus = GatewayStatus & {
  apiKey?: string;
  integrationId?: number;
  iframeId?: number;
  hmacSecret?: string;
};

type GatewaysData = {
  fawry: FawryStatus;
  paymob: PaymobStatus;
};

async function fetchGatewaysData(): Promise<GatewaysData> {
  const res = await fetch("/api/control/payment-gateways", {
    credentials: "include",
  });
  if (!res.ok) throw new Error("تعذر تحميل إعدادات البوابات");
  return res.json() as Promise<GatewaysData>;
}

async function saveGateway(body: unknown): Promise<void> {
  const res = await fetch("/api/control/payment-gateways", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = (await res.json()) as { ok?: boolean; error?: string };
  if (!res.ok) throw new Error(j.error ?? "فشل الحفظ");
}

function EnvSourceBadge() {
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
      من متغيرات الخادم
    </span>
  );
}

function FirestoreSourceBadge() {
  return (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
      محفوظ في Firestore
    </span>
  );
}

function FawryForm({
  initial,
  disabled,
  onSaved,
}: {
  initial: FawryStatus;
  disabled: boolean;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const merchantCode = String(fd.get("merchantCode") ?? "").trim();
    const secureKey = String(fd.get("secureKey") ?? "").trim();
    const enabled = fd.get("enabled") === "on";
    const sandbox = fd.get("sandbox") === "on";

    if (!merchantCode || !secureKey) {
      toast.error("يرجى ملء Merchant Code و Secure Key");
      return;
    }

    setSaving(true);
    try {
      await saveGateway({ fawry: { enabled, merchantCode, secureKey, sandbox } });
      toast.success("تم حفظ إعدادات فوري");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold">فوري (Fawry Pay)</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            بوابة الدفع الأكثر انتشاراً في مصر — بطاقات وكاش في الفروع.
          </p>
        </div>
        {initial.source === "env" ? <EnvSourceBadge /> : initial.source === "firestore" ? <FirestoreSourceBadge /> : null}
      </div>

      {initial.source === "env" ? (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-sm text-amber-900">
          الإعدادات مُقروءة من متغيرات الخادم ولا يمكن تعديلها من هنا. أضف الحقول أدناه لتجاوز قيم الخادم.
        </div>
      ) : null}

      <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => void handleSubmit(e)}>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={initial.enabled}
            />
            <span className="text-sm font-medium">تفعيل بوابة فوري في صفحة الدفع</span>
          </label>
        </div>

        <div>
          <label className="text-sm font-medium">Merchant Code</label>
          <ControlFieldHelp>
            كود التاجر من لوحة تحكم فوري — يبدأ عادةً بأرقام.
          </ControlFieldHelp>
          <input
            name="merchantCode"
            defaultValue={initial.merchantCode ?? ""}
            dir="ltr"
            placeholder="1234567"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Secure Key (Security Hash)</label>
          <ControlFieldHelp>
            مفتاح التوقيع السري من لوحة تحكم فوري — لا تشاركه مع أحد.
          </ControlFieldHelp>
          <input
            name="secureKey"
            type="password"
            defaultValue={initial.secureKey ?? ""}
            dir="ltr"
            placeholder={initial.secureKey ? "••••••••" : "أدخل المفتاح"}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
            autoComplete="new-password"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="sandbox"
              defaultChecked={initial.sandbox ?? false}
            />
            <span className="text-sm">وضع الاختبار (Staging) — لا تفعّله في الإنتاج</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" disabled={disabled || saving}>
            {saving ? "جاري الحفظ…" : "حفظ إعدادات فوري"}
          </Button>
        </div>
      </form>

      <details className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-900">روابط الـ Callback</summary>
        <div className="mt-2 space-y-1 font-mono text-xs" dir="ltr">
          <p className="text-slate-500">Return URL / IPN:</p>
          <p className="select-all break-all rounded bg-white px-2 py-1">
            /api/payments/fawry/callback
          </p>
        </div>
      </details>
    </section>
  );
}

function PaymobForm({
  initial,
  disabled,
  onSaved,
}: {
  initial: PaymobStatus;
  disabled: boolean;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const apiKey = String(fd.get("apiKey") ?? "").trim();
    const integrationId = Number(fd.get("integrationId") ?? "");
    const iframeId = Number(fd.get("iframeId") ?? "");
    const hmacSecret = String(fd.get("hmacSecret") ?? "").trim();
    const enabled = fd.get("enabled") === "on";

    if (!apiKey || !integrationId || !iframeId || !hmacSecret) {
      toast.error("يرجى ملء جميع حقول باي موب");
      return;
    }
    if (!Number.isFinite(integrationId) || integrationId <= 0) {
      toast.error("Integration ID يجب أن يكون رقماً صحيحاً");
      return;
    }

    setSaving(true);
    try {
      await saveGateway({ paymob: { enabled, apiKey, integrationId, iframeId, hmacSecret } });
      toast.success("تم حفظ إعدادات باي موب");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold">باي موب (PayMob / Accept)</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            بوابة دفع إلكتروني مصرية تدعم البطاقات والمحافظ وفوري وفودافون كاش.
          </p>
        </div>
        {initial.source === "env" ? <EnvSourceBadge /> : initial.source === "firestore" ? <FirestoreSourceBadge /> : null}
      </div>

      {initial.source === "env" ? (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-sm text-amber-900">
          الإعدادات مُقروءة من متغيرات الخادم ولا يمكن تعديلها من هنا.
        </div>
      ) : null}

      <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => void handleSubmit(e)}>
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={initial.enabled}
            />
            <span className="text-sm font-medium">تفعيل بوابة باي موب في صفحة الدفع</span>
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium">API Key</label>
          <ControlFieldHelp>
            مفتاح API من لوحة تحكم باي موب (قسم Settings → Account Info).
          </ControlFieldHelp>
          <input
            name="apiKey"
            type="password"
            defaultValue={initial.apiKey ?? ""}
            dir="ltr"
            placeholder={initial.apiKey ? "••••••••" : "ZXhhbXBsZV9hcGlfa2V5…"}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Integration ID</label>
          <ControlFieldHelp>
            معرف الـ Integration من قسم Developers → Payment Integrations.
          </ControlFieldHelp>
          <input
            name="integrationId"
            type="number"
            defaultValue={initial.integrationId ?? ""}
            dir="ltr"
            placeholder="12345"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium">iFrame ID</label>
          <ControlFieldHelp>
            معرف الـ iFrame من قسم Developers → iFrames.
          </ControlFieldHelp>
          <input
            name="iframeId"
            type="number"
            defaultValue={initial.iframeId ?? ""}
            dir="ltr"
            placeholder="67890"
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium">HMAC Secret</label>
          <ControlFieldHelp>
            مفتاح التحقق من إشعارات باي موب — من قسم Developers → Webhooks.
          </ControlFieldHelp>
          <input
            name="hmacSecret"
            type="password"
            defaultValue={initial.hmacSecret ?? ""}
            dir="ltr"
            placeholder={initial.hmacSecret ? "••••••••" : "أدخل الـ HMAC Secret"}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
            autoComplete="new-password"
          />
        </div>

        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" disabled={disabled || saving}>
            {saving ? "جاري الحفظ…" : "حفظ إعدادات باي موب"}
          </Button>
        </div>
      </form>

      <details className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-900">روابط الـ Callback / Webhook</summary>
        <div className="mt-2 space-y-1 font-mono text-xs" dir="ltr">
          <p className="text-slate-500">Processed Callback URL (Transaction Response):</p>
          <p className="select-all break-all rounded bg-white px-2 py-1">
            /api/payments/paymob/callback
          </p>
          <p className="mt-2 text-slate-500">Response URL (redirect after payment):</p>
          <p className="select-all break-all rounded bg-white px-2 py-1">
            /api/payments/paymob/callback
          </p>
        </div>
      </details>
    </section>
  );
}

export function PaymentGatewaysSettingsForm({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GatewaysData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchGatewaysData();
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ في التحميل");
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50/60 p-4 text-sm text-red-900">
        <p>{error}</p>
        <Button type="button" variant="secondary" onClick={() => void load()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">
          اضغط لتحميل إعدادات بوابات الدفع.
        </p>
        <Button
          type="button"
          className="mt-3"
          disabled={loading}
          onClick={() => void load()}
        >
          {loading ? "جاري التحميل…" : "تحميل الإعدادات"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <FawryForm
        initial={data.fawry}
        disabled={disabled ?? false}
        onSaved={() => void load()}
      />
      <PaymobForm
        initial={data.paymob}
        disabled={disabled ?? false}
        onSaved={() => void load()}
      />
    </div>
  );
}
