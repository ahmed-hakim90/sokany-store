"use client";

import { useMutation } from "@tanstack/react-query";
import type { ZodError } from "zod";
import { registerCustomer } from "@/features/auth/services/register";
import { login } from "@/features/auth/services/login";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { checkoutSchema } from "@/features/checkout/schema";
import { mapPayloadIssuesToCheckoutFields } from "@/features/checkout/lib/map-order-payload-issues";
import { clearCheckoutAmendSession, readCheckoutAmendSession } from "@/features/checkout/lib/checkout-amend-session";
import { toCreateOrderPayload } from "@/features/checkout/lib/to-create-order-payload";
import type { CheckoutFormData } from "@/features/checkout/types";
import type { CartItem } from "@/features/cart/types";
import { amendGuestOrder } from "@/features/orders/services/amendGuestOrder";
import { createOrder } from "@/features/orders/services/createOrder";
import { createOrderPayloadSchema } from "@/schemas/wordpress";

export type CheckoutOrderMutationInput = {
  values: CheckoutFormData;
  items: CartItem[];
  /** Set after Firebase Phone Auth + Firestore `storefront_customers/{uid}` write. */
  firebaseUid?: string;
};

export class CheckoutOrderMutationError extends Error {
  readonly kind: "checkout" | "payload" | "empty_cart" | "register";
  readonly fieldErrors: Partial<Record<keyof CheckoutFormData, string>>;
  readonly zodError?: ZodError;

  constructor(params: {
    kind: "checkout" | "payload" | "empty_cart" | "register";
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
    mutationFn: async ({ values, items, firebaseUid }: CheckoutOrderMutationInput) => {
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

      const data = checkoutParsed.data;
      const amend = readCheckoutAmendSession();

      const wantsNewAccount =
        !amend && data.createAccount && !useAuthStore.getState().isAuthenticated;

      let customerId: number | undefined;
      if (wantsNewAccount) {
        try {
          const reg = await registerCustomer({
            email: data.contactEmail,
            username: data.contactEmail,
            password: data.accountPassword,
            firstName: data.contactFirstName,
            lastName: data.contactLastName,
          });
          customerId = reg.customerId;
        } catch (e) {
          const msg =
            e instanceof Error ? e.message : "تعذر إنشاء الحساب. حاول مرة أخرى.";
          throw new CheckoutOrderMutationError({
            kind: "register",
            message: msg,
            fieldErrors: { accountPassword: msg },
            cause: e,
          });
        }
      }

      const rawPayload = toCreateOrderPayload(data, items, {
        customerId,
        firebaseUid,
      });
      const payloadParsed = createOrderPayloadSchema.safeParse(rawPayload);
      if (!payloadParsed.success) {
        throw new CheckoutOrderMutationError({
          kind: "payload",
          message: "Order payload validation failed",
          fieldErrors: mapPayloadIssuesToCheckoutFields(payloadParsed.error.issues),
          zodError: payloadParsed.error,
        });
      }

      let order;
      if (amend) {
        order = await amendGuestOrder({
          ...payloadParsed.data,
          orderId: amend.orderId,
          orderKey: amend.orderKey,
        });
        clearCheckoutAmendSession();
      } else {
        order = await createOrder(payloadParsed.data);
        /* مسح جلسة تعديل يتيمة (مثلاً بعد إلغاء طلب سابق دون فتح مسار التعديل حتى النهاية) */
        clearCheckoutAmendSession();
      }

      if (wantsNewAccount && customerId !== undefined) {
        try {
          await login({
            username: data.contactEmail,
            password: data.accountPassword,
          });
        } catch {
          /* الطلب أُنشئ؛ تسجيل الدخول التلقائي اختياري */
        }
      }

      return order;
    },
  });
}
