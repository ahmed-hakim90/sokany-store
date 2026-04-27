"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import type { CmsStorefrontIntegrations } from "@/schemas/cms";

type Props = {
  initial: CmsStorefrontIntegrations | undefined;
  disabled: boolean;
  onSave: (doc: CmsStorefrontIntegrations) => void;
};

/**
 * تكاملات علنية (روابط) + ملاحظة — من صفحة `/control/dev` (ليست تبويب «عام»).
 * ‎`WC_CONSUMER_KEY` / ‎`SECRET` و‎`WC_WEBHOOK_SECRET` تبقى في ‎Vercel / ‎`.env`‎.
 */
export function StorefrontIntegrationsForm({ initial, disabled, onSave }: Props) {
  const [wooBaseUrl, setWooBaseUrl] = useState(
    () => initial?.wooBaseUrl ?? "",
  );
  const [publicStorefrontBaseUrl, setPublicStorefrontBaseUrl] = useState(
    () => initial?.publicStorefrontBaseUrl ?? "",
  );
  const [publicReadBaseUrl, setPublicReadBaseUrl] = useState(
    () => initial?.publicReadBaseUrl ?? "",
  );
  const [externalDataWebhookUrl, setExternalDataWebhookUrl] = useState(
    () => initial?.externalDataWebhookUrl ?? "",
  );
  const [adminNote, setAdminNote] = useState(() => initial?.adminNote ?? "");

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div>
        <h2 className="font-display text-lg font-bold">تكاملات (عناوين API وو + النطاق)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          اضبط <strong className="text-foreground">عنوان ووردبرس</strong> و/أو{" "}
          <strong className="text-foreground">نطاق واجهة نيكست</strong> من هنا بدل تعديل الريبو عند
          تغيّر الاستضافة. الأسرار (مفاتيح Woo، توقيع الويبهوك) تبقى في Vercel /{" "}
          <code className="rounded bg-surface-muted px-1">.env</code>.
        </p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium" htmlFor="sf-woo-base">
            wooBaseUrl
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground" dir="ltr">
            WordPress + Woo (REST). If set, replaces <code className="rounded bg-surface-muted px-1">WC_BASE_URL</code> on the server. Keys
            stay in env: <code className="rounded bg-surface-muted px-1">WC_CONSUMER_KEY</code> / <code className="rounded bg-surface-muted px-1">SECRET</code>.
          </p>
          <input
            id="sf-woo-base"
            type="url"
            inputMode="url"
            placeholder="https://shop.example.com"
            value={wooBaseUrl}
            onChange={(e) => setWooBaseUrl(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm ltr"
            dir="ltr"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="sf-storefront">
            publicStorefrontBaseUrl
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <strong className="text-foreground">HTTPS</strong> — نطاق هذا الـ front (نيكست) فقط. يُبنى منه رابط
            ويبهوك وو والويبهوك الخارجي (بدل{" "}
            <code className="rounded bg-surface-muted px-1" dir="ltr">
              NEXT_PUBLIC_SITE_URL
            </code>
            ).
            انسخ العناوين من صفحة{" "}
            <a className="font-medium text-foreground underline" href="/control/woo-api">
              Woo &amp; API
            </a>
            .
          </p>
          <input
            id="sf-storefront"
            type="url"
            inputMode="url"
            placeholder="https://app.example.com"
            value={publicStorefrontBaseUrl}
            onChange={(e) => setPublicStorefrontBaseUrl(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm ltr"
            dir="ltr"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="sf-pub-api">
            publicReadBaseUrl
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            رابط <strong className="text-foreground">HTTPS</strong> لقراءة بيانات علنية من API اختياري. السر
            (إن وُجد) عبر <code className="rounded bg-surface-muted px-1">INTEGRATION_SERVER_SECRET</code> في
            الـ env.
          </p>
          <input
            id="sf-pub-api"
            type="url"
            inputMode="url"
            placeholder="https://api.example.com/v1"
            value={publicReadBaseUrl}
            onChange={(e) => setPublicReadBaseUrl(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm"
            autoComplete="off"
          />
        </div>
        <div>
          <label
            className="text-sm font-medium"
            htmlFor="sf-external-data-webhook"
          >
            externalDataWebhookUrl
          </label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            رابط <strong className="text-foreground">HTTPS</strong> كامل لـ <code className="rounded bg-surface-muted px-1" dir="ltr">POST /api/webhooks/external-data</code>{" "}
            (يظهر في{" "}
            <a
              className="font-medium text-foreground underline underline-offset-2"
              href="/control/woo-api"
            >
              Woo &amp; API
            </a>
            ). السر يبقى في env — <code className="rounded bg-surface-muted px-1" dir="ltr">EXTERNAL_DATA_WEBHOOK_SECRET</code>.
          </p>
          <input
            id="sf-external-data-webhook"
            type="url"
            inputMode="url"
            placeholder="https://store.example.com/api/webhooks/external-data"
            value={externalDataWebhookUrl}
            onChange={(e) => setExternalDataWebhookUrl(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-mono text-sm ltr"
            dir="ltr"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="sf-admin-note">
            ملاحظة (داخلية — لا تظهر في المتجر)
          </label>
          <textarea
            id="sf-admin-note"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            placeholder="مثال: مفتاح الاستدعاء في env تحت INTEGRATION_SERVER_SECRET"
          />
        </div>
        <Button
          type="button"
          disabled={disabled}
          onClick={() => {
            const wb = wooBaseUrl.trim();
            const sf = publicStorefrontBaseUrl.trim();
            const u = publicReadBaseUrl.trim();
            const hook = externalDataWebhookUrl.trim();
            const n = adminNote.trim();
            onSave({
              wooBaseUrl: wb ? wb : undefined,
              publicStorefrontBaseUrl: sf ? sf : undefined,
              publicReadBaseUrl: u ? u : undefined,
              externalDataWebhookUrl: hook ? hook : undefined,
              adminNote: n ? n : undefined,
            });
          }}
        >
          {disabled ? "جاري الحفظ…" : "حفظ التكاملات"}
        </Button>
      </div>
    </section>
  );
}
