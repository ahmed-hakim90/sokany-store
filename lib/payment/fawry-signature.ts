import "server-only";

import { createHash } from "crypto";

export const FAWRY_REFERENCE_PAYMENT_METHOD = "PayAtFawry" as const;
export const FAWRY_CURRENCY_CODE = "EGP" as const;

export type FawryHostedChargeItemSignatureInput = {
  itemId: string;
  quantity: string | number;
  price: string | number;
};

export type FawryHostedSignatureInput = {
  merchantCode: string;
  merchantRefNum: string;
  customerProfileId?: string;
  returnUrl: string;
  chargeItems: FawryHostedChargeItemSignatureInput[];
  secureKey: string;
};

export type FawryReferenceSignatureInput = {
  merchantCode: string;
  merchantRefNum: string;
  customerProfileId?: string;
  paymentMethod?: string;
  amount: string | number;
  secureKey: string;
};

export function formatFawryAmount(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid Fawry amount");
  }
  return amount.toFixed(2);
}

function normalizedPart(value: string | number | undefined): string {
  return value == null ? "" : String(value).trim();
}

function normalizedPrice(value: string | number): string {
  const numeric = typeof value === "number" ? value : Number(value.trim());
  return formatFawryAmount(numeric);
}

/**
 * Fawry hosted checkout signature order:
 * merchantCode + merchantRefNum + customerProfileId(if any) + returnUrl
 * + for each item: itemId + quantity + price(two decimals) + secureKey
 *
 * Fawry docs explicitly omit paymentMethod from this hosted signature even when
 * a hosted page is restricted to one payment method.
 */
export function buildFawryHostedSignature(input: FawryHostedSignatureInput): string {
  const itemsPart = input.chargeItems
    .map((item) => [
      normalizedPart(item.itemId),
      normalizedPart(item.quantity),
      normalizedPrice(item.price),
    ].join(""))
    .join("");
  const raw = [
    normalizedPart(input.merchantCode),
    normalizedPart(input.merchantRefNum),
    normalizedPart(input.customerProfileId),
    normalizedPart(input.returnUrl),
    itemsPart,
    normalizedPart(input.secureKey),
  ].join("");

  return createHash("sha256").update(raw, "utf8").digest("hex");
}

/**
 * Fawry reference-number signature order:
 * merchantCode + merchantRefNum + customerProfileId(if any) + paymentMethod
 * + amount(two decimals, e.g. 10.00) + secureKey
 */
export function buildFawryReferenceSignature(
  input: FawryReferenceSignatureInput,
): string {
  const amount =
    typeof input.amount === "number"
      ? formatFawryAmount(input.amount)
      : normalizedPart(input.amount);
  const raw = [
    normalizedPart(input.merchantCode),
    normalizedPart(input.merchantRefNum),
    normalizedPart(input.customerProfileId),
    input.paymentMethod ?? FAWRY_REFERENCE_PAYMENT_METHOD,
    amount,
    normalizedPart(input.secureKey),
  ].join("");

  return createHash("sha256").update(raw, "utf8").digest("hex");
}
