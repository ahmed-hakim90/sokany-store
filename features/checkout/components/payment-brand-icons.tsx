"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MethodBadgeTone =
  | "visa"
  | "meeza"
  | "mada"
  | "cash"
  | "fawry"
  | "vodafone"
  | "orange"
  | "etisalat"
  | "kiosk"
  | "wallet";

const METHOD_BADGE_TONES: Record<MethodBadgeTone, string> = {
  visa: "border-[#1a1f71]/20 bg-[#1a1f71]/10 text-[#1a1f71]",
  meeza: "border-purple-200 bg-purple-50 text-purple-800",
  mada: "border-emerald-200 bg-emerald-50 text-emerald-800",
  cash: "border-amber-200 bg-amber-50 text-amber-800",
  fawry: "border-[#1f6e43]/20 bg-[#1f6e43]/10 text-[#1f6e43]",
  vodafone: "border-red-200 bg-red-50 text-red-700",
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  etisalat: "border-teal-200 bg-teal-50 text-teal-700",
  kiosk: "border-slate-200 bg-slate-50 text-slate-700",
  wallet: "border-brand-200 bg-brand-50 text-brand-900",
};

function MethodBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: MethodBadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-5",
        METHOD_BADGE_TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

function PaymentMethodBadgeGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-2">
      <span className="sr-only">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5" aria-hidden>
        {children}
      </div>
    </div>
  );
}

export function CodMethodBadges() {
  return (
    <PaymentMethodBadgeGroup label="يدعم الدفع نقداً، أو الدفع ببطاقة مع المندوب عند الاستلام.">
      <MethodBadge tone="cash">نقدي</MethodBadge>
      <MethodBadge tone="kiosk">بطاقة مع المندوب</MethodBadge>
    </PaymentMethodBadgeGroup>
  );
}

export function CardMethodBadges() {
  return (
    <PaymentMethodBadgeGroup label="يدعم Visa و Mastercard و مدى و ميزة حسب بوابة الدفع المفعلة.">
      <MethodBadge tone="visa">Visa</MethodBadge>
      <MethodBadge tone="visa">Mastercard</MethodBadge>
      <MethodBadge tone="mada">مدى</MethodBadge>
      <MethodBadge tone="meeza">ميزة</MethodBadge>
    </PaymentMethodBadgeGroup>
  );
}

export function FawryMethodBadges() {
  return (
    <PaymentMethodBadgeGroup label="يدعم فوري البطاقات البنكية، كاش فروع فوري، فودافون كاش، والمحافظ الإلكترونية.">
      <MethodBadge tone="visa">Visa/MC</MethodBadge>
      <MethodBadge tone="fawry">كاش فروع فوري</MethodBadge>
      <MethodBadge tone="vodafone">فودافون كاش</MethodBadge>
      <MethodBadge tone="wallet">محافظ</MethodBadge>
    </PaymentMethodBadgeGroup>
  );
}

export function PaymobMethodBadges() {
  return (
    <PaymentMethodBadgeGroup label="يدعم باي موب البطاقات البنكية، مدى، ميزة، فودافون كاش، أورنج، اتصالات، والكيوسك.">
      <MethodBadge tone="visa">Visa/MC</MethodBadge>
      <MethodBadge tone="mada">مدى</MethodBadge>
      <MethodBadge tone="meeza">ميزة</MethodBadge>
      <MethodBadge tone="vodafone">فودافون كاش</MethodBadge>
      <MethodBadge tone="orange">أورنج</MethodBadge>
      <MethodBadge tone="etisalat">اتصالات</MethodBadge>
      <MethodBadge tone="kiosk">كيوسك</MethodBadge>
    </PaymentMethodBadgeGroup>
  );
}
