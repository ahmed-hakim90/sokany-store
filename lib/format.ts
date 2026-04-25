import { CURRENCY_LOCALE, DEFAULT_CURRENCY } from "@/lib/constants";

const currencyFormatOptions = {
  style: "currency" as const,
  currency: DEFAULT_CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  numberingSystem: "latn" as const,
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE, currencyFormatOptions).format(
    amount,
  );
}

export function formatPriceEgp(amount: string | number): string {
  const n = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (!Number.isFinite(n)) return String(amount);
  return new Intl.NumberFormat(CURRENCY_LOCALE, currencyFormatOptions).format(
    n,
  );
}

/**
 * Latin digits, en-US grouping — readable without wide Arabic-indic separators.
 * Pair with a separate small «ج.م» label in floating checkout UI.
 */
export function formatPriceAmountCheckout(amount: number): string {
  if (!Number.isFinite(amount)) return "0";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount);
}
