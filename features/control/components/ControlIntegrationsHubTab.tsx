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

export function ControlIntegrationsHubTab({
  initialIntegrations,
  disabled,
  onSaveIntegrations,
}: Props) {
  return (
    <div className="space-y-10">
      <section className="space-y-3" aria-labelledby="control-health-system">
        <h2 id="control-health-system" className="font-display text-lg font-bold text-slate-900">
          حالة الموقع دلوقتي
        </h2>
        <ControlHealthTab />
      </section>
      <section className="space-y-3 border-t border-border pt-8" aria-labelledby="control-health-woo">
        <h2 id="control-health-woo" className="font-display text-lg font-bold text-slate-900">
          Woo والروابط المهمة
        </h2>
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
        <h2 id="control-health-forwarding" className="font-display text-lg font-bold text-slate-900">
          الطلبات وإعادة التوجيه
        </h2>
        <OrderForwardingSettingsTab />
      </section>
    </div>
  );
}
