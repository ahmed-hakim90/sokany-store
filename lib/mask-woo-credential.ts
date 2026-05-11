import "server-only";

import { resolveWooCredentialsForServer } from "@/lib/woo-credentials-store";

/**
 * عرض آمن — لا يعيد مفاتيح كاملة. ‎Woo: ‎`ck_` / ‎`cs_` / نفس الفكرة.
 */
export function maskWooKeyFragment(value: string | undefined | null): string | null {
  const t = (value ?? "").trim();
  if (!t) return null;
  if (t.length <= 10) return "****";
  if (t.startsWith("ck_") || t.startsWith("cs_")) {
    const pre = t.slice(0, 3);
    const last = t.slice(-4);
    return `${pre}****_${last}`;
  }
  return `${t.slice(0, 2)}****${t.slice(-4)}`;
}

export async function getMaskedWooCredentialHints(): Promise<{
  hasConsumerKey: boolean;
  hasConsumerSecret: boolean;
  consumerKeyDisplay: string | null;
  source: "env" | "firestore" | null;
}> {
  const resolved = await resolveWooCredentialsForServer().catch(() => null);
  return {
    hasConsumerKey: Boolean(resolved?.consumerKey),
    hasConsumerSecret: Boolean(resolved?.consumerSecret),
    consumerKeyDisplay: maskWooKeyFragment(resolved?.consumerKey),
    source: resolved?.source ?? null,
  };
}
