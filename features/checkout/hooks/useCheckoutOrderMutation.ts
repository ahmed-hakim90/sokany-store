"use client";

import { useMutation } from "@tanstack/react-query";
import type { ZodError } from "zod";
import { checkoutSchema } from "@/features/checkout/schema";
import { mapPayloadIssuesToCheckoutFields } from "@/features/checkout/lib/map-order-payload-issues";
import { toCreateOrderPayload } from "@/features/checkout/lib/to-create-order-payload";
import type { CheckoutFormData } from "@/features/checkout/types";
import type { CartItem } from "@/features/cart/types";
import { createOrder } from "@/features/orders/services/createOrder";
import { createOrderPayloadSchema } from "@/schemas/wordpress";

export type CheckoutOrderMutationInput = {
  values: CheckoutFormData;
  items: CartItem[];
};

export class CheckoutOrderMutationError extends Error {
  readonly kind: "checkout" | "payload" | "empty_cart";
  readonly fieldErrors: Partial<Record<keyof CheckoutFormData, string>>;
  readonly zodError?: ZodError;

  constructor(params: {
    kind: "checkout" | "payload" | "empty_cart";
    message: string;
    fieldErrors?: Partial<Record<keyof CheckoutFormData, string>>;
    zodError?: ZodError;
    cause?: unknown;
  }) {
    super(params.message, { cause: params.cause });
    this.name = "CheckoutOrderMutationError";
    this.kind = params.kind;
    this.fieldErrors = params.fieldErrors ?? {};
    this.zodError = params.zodError;
  }

  static is(e: unknown): e is CheckoutOrderMutationError {
    return e instanceof CheckoutOrderMutationError;
  }
}

function checkoutFieldErrors(
  error: ZodError,
): Partial<Record<keyof CheckoutFormData, string>> {
  const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
  for (const issue of error.issues) {
    const path = issue.path[0];
    if (typeof path === "string") {
      fieldErrors[path as keyof CheckoutFormData] = issue.message;
    }
  }
  return fieldErrors;
}

export function useCheckoutOrderMutation() {
  return useMutation({
    mutationKey: ["checkout", "createOrder"],
    mutationFn: async ({ values, items }: CheckoutOrderMutationInput) => {
      if (items.length === 0) {
        throw new CheckoutOrderMutationError({
          kind: "empty_cart",
          message: "Cart is empty",
        });
      }

      const checkoutParsed = checkoutSchema.safeParse(values);
      if (!checkoutParsed.success) {
        throw new CheckoutOrderMutationError({
          kind: "checkout",
          message: "Checkout form validation failed",
          fieldErrors: checkoutFieldErrors(checkoutParsed.error),
          zodError: checkoutParsed.error,
        });
      }

      const rawPayload = toCreateOrderPayload(checkoutParsed.data, items);
      const payloadParsed = createOrderPayloadSchema.safeParse(rawPayload);
      if (!payloadParsed.success) {
        throw new CheckoutOrderMutationError({
          kind: "payload",
          message: "Order payload validation failed",
          fieldErrors: mapPayloadIssuesToCheckoutFields(payloadParsed.error.issues),
          zodError: payloadParsed.error,
        });
      }

      return createOrder(payloadParsed.data);
    },
  });
}
