import "server-only";

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

export function getMaskedWooCredentialHints(): {
  hasConsumerKey: boolean;
  hasConsumerSecret: boolean;
  consumerKeyDisplay: string | null;
} {
  return {
    hasConsumerKey: Boolean(process.env.WC_CONSUMER_KEY?.trim()),
    hasConsumerSecret: Boolean(process.env.WC_CONSUMER_SECRET?.trim()),
    consumerKeyDisplay: maskWooKeyFragment(process.env.WC_CONSUMER_KEY),
  };
}
