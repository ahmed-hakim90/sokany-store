import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CommandCenter } from "./command-center";
import { StorefrontIntegrationsPanel } from "./storefront-integrations-panel";
import { getControlSessionUser } from "@/lib/get-control-session-for-page";
import { getMaskedWooCredentialHints } from "@/lib/mask-woo-credential";

export const metadata: Metadata = {
  title: "Site health",
  robots: { index: false, follow: false },
};

/*
 * ‎/control/dev — مركز تشخيص: بطاقات نبض (زمن ‎Woo + نجاح 24h + آخر سجل) ثم
 * ‎(sm+)‎: أعمدة زر اختبارات. على الجوال: عمود واحد والأزرار بعرض ممتلئ.
 */
export default async function ControlDevPage() {
  const user = await getControlSessionUser();
  if (!user) {
    redirect("/control/login");
  }
  if (user.scope === "media") {
    redirect("/control");
  }
  const maskedHint = getMaskedWooCredentialHints();
  return (
    <div className="min-h-dvh w-full flex-1 bg-slate-50 text-slate-900">
      <CommandCenter maskedHint={maskedHint} />
      <StorefrontIntegrationsPanel />
    </div>
  );
}
