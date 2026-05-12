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
import { ONLINE_PAYMENT_METHODS } from "@/features/checkout/types";
import type { CartItem } from "@/features/cart/types";
import { amendGuestOrder } from "@/features/orders/services/amendGuestOrder";
import { createOrder } from "@/features/orders/services/createOrder";
import { createOrderPayloadSchema } from "@/schemas/wordpress";
import { apiClient } from "@/lib/api";

async function initiateOnlinePayment(
  paymentMethod: "fawry" | "paymob",
  params: {
    orderId: number;
    orderTotal: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingCity?: string;
    shippingState?: string;
  },
): Promise<string> {
  const endpoint = paymentMethod === "fawry"
    ? "/payments/fawry"
    : "/payments/paymob";
  const res = await apiClient.post(endpoint, {
    orderId: params.orderId,
    orderTotal: params.orderTotal,
    customerName: params.customerName,
    customerPhone: params.customerPhone,
    customerEmail: params.customerEmail,
    ...(paymentMethod === "paymob"
      ? { shippingCity: params.shippingCity, shippingState: params.shippingState }
      : {}),
  });
  const data = res.data as { redirectUrl?: string; iframeUrl?: string };
  const url = data.redirectUrl ?? data.iframeUrl;
  if (!url) throw new Error("لم يتم استلام رابط الدفع من البوابة");
  return url;
}

export type CheckoutOrderMutationInput = {
  values: CheckoutFormData;
  items: CartItem[];
  couponCode?: string;
  /** اختياري — مثلاً بعد مصادقة هاتف مستقبلية */
  firebaseUid?: string;
};

export type CheckoutOrderMutationResult = {
  order: Awaited<ReturnType<typeof createOrder>>;
  /** رابط بوابة الدفع الأونلاين — موجود فقط لفوري وباي موب */
  paymentRedirectUrl?: string;
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
  return useMutation<CheckoutOrderMutationResult, Error, CheckoutOrderMutationInput>({
    mutationKey: ["checkout", "createOrder"],
    mutationFn: async ({ values, items, couponCode, firebaseUid }: CheckoutOrderMutationInput) => {
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
        !amend &&
        data.createAccount &&
        !useAuthStore.getState().isAuthenticated &&
        data.contactEmail.trim().length > 0 &&
        data.accountPassword.length >= 8;

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
        couponCode,
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

      if (ONLINE_PAYMENT_METHODS.has(data.paymentMethod)) {
        const orderTotal =
          typeof order.total === "number"
            ? order.total
            : parseFloat(String(order.total) || "0");

        const pm = data.paymentMethod as "fawry" | "paymob";
        const paymentRedirectUrl = await initiateOnlinePayment(pm, {
          orderId: order.id,
          orderTotal,
          customerName: `${data.contactFirstName} ${data.contactLastName}`.trim(),
          customerPhone: data.contactPhone,
          customerEmail: data.contactEmail,
          shippingCity: data.shippingCity,
          shippingState: data.shippingState,
        });
        return { order, paymentRedirectUrl };
      }

      return { order };
    },
  });
}
