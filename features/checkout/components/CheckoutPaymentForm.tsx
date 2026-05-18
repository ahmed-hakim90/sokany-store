"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckoutSectionChip } from "@/features/checkout/components/checkout-section-chip";
import {
  CardMethodBadges,
  CodMethodBadges,
  FawryMethodBadges,
  PaymobMethodBadges,
} from "@/features/checkout/components/payment-brand-icons";
import { PaymentOptionCard } from "@/features/checkout/components/payment-option-card";
import type { CheckoutFormData } from "@/features/checkout/types";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

export type CheckoutPaymentFormProps = {
  values: CheckoutFormData;
  errors: Partial<Record<keyof CheckoutFormData, string>>;
  onPaymentMethodChange: (value: CheckoutFormData["paymentMethod"]) => void;
  /** داخل بطاقة خطوة — بدون إطار Card مكرر */
  embedded?: boolean;
};

type PaymentOption = {
  value: CheckoutFormData["paymentMethod"];
  title: string;
  description: string;
  extra?: ReactNode;
};

const ALWAYS_ON_OPTIONS: PaymentOption[] = [
  {
    value: "cod",
    title: "الدفع عند الاستلام",
    description: "ادفع نقداً أو ببطاقة عند استلام الطلب من المندوب.",
    extra: <CodMethodBadges />,
  },
  // {
  //   value: "card",
  //   title: "بطاقة بنكية أو محفظة",
  //   description:
  //     "بطاقات مدى أو ميزة، أو محافظ إلكترونية مصرية على الجوال — حسب تفعيل بوابة الدفع في المتجر.",
  //   extra: <CardMethodBadges />,
  // },
];

const GATEWAY_OPTIONS: Record<"fawry" | "paymob", PaymentOption> = {
  fawry: {
    value: "fawry",
    title: "فوري",
    description: "انتقل إلى صفحة فوري الآمنة لإتمام الدفع بالطرق المفعّلة لحساب التاجر.",
    extra: <FawryMethodBadges />,
  },
  paymob: {
    value: "paymob",
    title: "باي موب",
    description: "ادفع ببطاقة بنكية أو محفظة مباشرةً عبر باي موب.",
    extra: <PaymobMethodBadges />,
  },
};

type GatewaysConfig = { fawry: boolean; paymob: boolean };

function useEnabledGateways(): GatewaysConfig | null {
  const [config, setConfig] = useState<GatewaysConfig | null>(null);

  useEffect(() => {
    fetch("/api/payments/config")
      .then((r) => r.json() as Promise<GatewaysConfig>)
      .then((data) => setConfig(data))
      .catch(() => setConfig({ fawry: false, paymob: false }));
  }, []);

  return config;
}

export function CheckoutPaymentForm({
  values,
  errors,
  onPaymentMethodChange,
  embedded = false,
}: CheckoutPaymentFormProps) {
  const gateways = useEnabledGateways();

  const options: PaymentOption[] = [
    ...ALWAYS_ON_OPTIONS,
    ...(gateways?.fawry ? [GATEWAY_OPTIONS.fawry] : []),
    ...(gateways?.paymob ? [GATEWAY_OPTIONS.paymob] : []),
  ];

  const gatewaysLoaded = gateways !== null;
  const onlineGatewaysUnavailable =
    gatewaysLoaded && !gateways.fawry && !gateways.paymob;

  const body = (
    <>
      {!embedded ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="checkout-payment-heading"
            className="font-display text-lg font-semibold tracking-tight text-brand-950"
          >
            طريقة الدفع
          </h2>
          <CheckoutSectionChip>آمن</CheckoutSectionChip>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <CheckoutSectionChip>آمن</CheckoutSectionChip>
        </div>
      )}

      {onlineGatewaysUnavailable ? (
        <p
          className={cn(
            surfacePanelClass,
            "border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-xs leading-relaxed text-amber-950",
          )}
          role="status"
        >
          الدفع الإلكتروني (فوري / باي موب) غير متاح حالياً — يمكنك إتمام الطلب بالدفع عند
          الاستلام.
        </p>
      ) : null}

      <div className="space-y-2.5" role="radiogroup" aria-labelledby="checkout-payment-heading">
        {options.map((opt) => (
          <PaymentOptionCard
            key={opt.value}
            title={opt.title}
            description={opt.description}
            extra={opt.extra}
            selected={values.paymentMethod === opt.value}
            onSelect={() => onPaymentMethodChange(opt.value)}
          />
        ))}
      </div>
      {errors.paymentMethod ? (
        <p className="text-start text-xs text-red-600" role="alert">
          {errors.paymentMethod}
        </p>
      ) : null}
    </>
  );

  if (embedded) {
    return <div className="space-y-4">{body}</div>;
  }

  return (
    <Card
      variant="summary"
      className="space-y-4 rounded-2xl border-black/[0.05] p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] sm:p-5"
    >
      {body}
    </Card>
  );
}
