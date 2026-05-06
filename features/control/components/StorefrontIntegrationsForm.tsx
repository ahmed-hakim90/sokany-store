"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ControlFieldHelp } from "@/features/control/components/control-field-help";
import { ControlAdvancedDetails } from "@/features/control/components/control-page-chrome";
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
        <h2 className="font-display text-lg font-bold">روابط الربط الأساسية</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          اكتب هنا الروابط التي يعتمد عليها الموقع في قراءة البيانات أو استقبال التحديثات. لو حقل لا تحتاجه اتركه فارغًا.
        </p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium" htmlFor="sf-woo-base">
            رابط لوحة المنتجات
          </label>
          <ControlFieldHelp>
            هذا هو الرابط الذي يقرأ منه الموقع المنتجات والتصنيفات.
          </ControlFieldHelp>
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
            رابط الموقع الحالي
          </label>
          <ControlFieldHelp>
            هذا هو الرابط الذي يفتحه العميل. غالبًا يكون نفس دومين الموقع الحالي. إذا كنت غير متأكد ستجده في صفحة{" "}
            <a className="font-medium text-foreground underline" href="/control/woo-api">
              الربط
            </a>
            .
          </ControlFieldHelp>
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
            رابط مصدر إضافي
          </label>
          <ControlFieldHelp>
            استخدمه فقط إذا كان الموقع يقرأ بيانات من مكان إضافي غير المصدر الأساسي.
          </ControlFieldHelp>
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
        <ControlAdvancedDetails summary="إعدادات إضافية">
          <div>
            <label
              className="text-sm font-medium"
              htmlFor="sf-external-data-webhook"
            >
              رابط استقبال التحديثات الخارجية
            </label>
            <ControlFieldHelp>
              هذا هو الرابط الذي ترسل عليه الأنظمة الأخرى أي تحديث جديد تريد أن يصل للموقع.
              ستجده أيضًا في صفحة{" "}
              <a
                className="font-medium text-foreground underline underline-offset-2"
                href="/control/woo-api"
              >
                الربط
              </a>
              .
            </ControlFieldHelp>
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
              ملاحظة داخلية
            </label>
            <ControlFieldHelp>
              اكتب ملاحظة سريعة تفهمك لماذا أضفت هذا الربط أو من المسؤول عنه. هذه الملاحظة لا تظهر للعميل.
            </ControlFieldHelp>
            <textarea
              id="sf-admin-note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
              placeholder="مثال: هذا الرابط خاص بالنظام الداخلي للمخزن"
            />
          </div>
        </ControlAdvancedDetails>
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
