import { CURRENCY_LOCALE, DEFAULT_CURRENCY } from "@/lib/constants";

const currencyFormatOptions = {
  style: "currency" as const,
  currency: DEFAULT_CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  numberingSystem: "arab" as const,
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
