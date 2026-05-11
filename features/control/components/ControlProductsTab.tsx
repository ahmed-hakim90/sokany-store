"use client";

import { ControlInventoryTab } from "@/features/control/components/ControlInventoryTab";
import { ControlProduct3DAssetsTab } from "@/features/control/components/ControlProduct3DAssetsTab";

export function ControlProductsTab() {
  return (
    <div className="space-y-8">
      <section className="space-y-3" aria-labelledby="control-products-inventory">
        <h2 id="control-products-inventory" className="font-display text-lg font-bold text-slate-900">
          المخزون وحالة المنتجات
        </h2>
        <ControlInventoryTab />
      </section>
      <section
        className="space-y-3 border-t border-border pt-8"
        aria-labelledby="control-products-3d"
      >
        <h2 id="control-products-3d" className="font-display text-lg font-bold text-slate-900">
          موديلات 3D المرتبطة بالمنتجات
        </h2>
        <ControlProduct3DAssetsTab />
      </section>
    </div>
  );
}
