"use client";

import { Link } from "next-view-transitions";
import { useStoreHotline } from "@/features/store/hooks/useStoreHotline";
import {
  latinDigitsFromHotline,
  STORE_HOTLINE_FALLBACK,
} from "@/features/store/lib/hotline-digits";
import { cn } from "@/lib/utils";

function HotlineDigits({
  digits,
  className,
}: {
  digits: string;
  className?: string;
}) {
  return (
    <span
      dir="ltr"
      lang="en"
      className={cn(
        "inline-flex min-w-0 items-baseline gap-px font-wordmark tabular-nums font-semibold text-brand-950",
        className,
      )}
    >
      {digits.split("").map((ch, i) =>
        ch === "3" ? (
          <span
            key={`${i}-${ch}`}
            className="text-xl font-black leading-none text-red-600"
          >
            {ch}
          </span>
        ) : (
          <span key={`${i}-${ch}`} className="leading-none">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

export type MobileStoreHotlineProps = {
  className?: string;
  /** `premium`: الرقم مع تسمية «خدمة العملاء» (هيدر الموبايل)؛ `inline`: السطر المعتاد (ديمو/الديسكتوب). */
  layout?: "inline" | "premium";
};

export function MobileStoreHotline({
  className,
  layout = "inline",
}: MobileStoreHotlineProps) {
  const { data, isPending } = useStoreHotline();
  const raw = data?.hotline?.trim() || STORE_HOTLINE_FALLBACK;
  const tel = latinDigitsFromHotline(raw);

  if (isPending) {
    return (
      <span
        className={cn(
          "inline-flex h-11 min-w-0 max-w-none shrink-0 items-center whitespace-nowrap font-wordmark text-sm font-semibold tracking-tight text-muted-foreground/35",
          layout === "premium" &&
            "h-11 min-w-[4.75rem] max-w-[9rem] items-center rounded-2xl border border-black/[0.06] bg-white/85 px-2 py-1.5 shadow-sm",
          "animate-pulse",
          className,
        )}
        aria-hidden
        dir="ltr"
        lang="en"
      >
        {STORE_HOTLINE_FALLBACK}
      </span>
    );
  }

  if (layout === "premium") {
    return (
      <Link
        href={`tel:${tel}`}
        className={cn(
          "inline-flex max-w-none min-w-0 shrink-0 touch-manipulation flex-col items-start gap-1 rounded-2xl px-2 py-1.5 leading-none",
          "text-brand-950 transition-[background-color,box-shadow,color] duration-200 ease-out",
          "outline-none hover:bg-white/70 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
          className,
        )}
        aria-label={`خدمة العملاء — الاتصال على ${tel}`}
      >
        <HotlineDigits digits={tel} className="text-[15px] font-black" />
        <span className="text-[10px] font-bold text-brand-900/75">
          خدمة العملاء
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`tel:${tel}`}
      className={cn(
        "inline-flex h-11 min-w-0 max-w-full shrink-0 items-center justify-center rounded-none border-0 bg-transparent p-0 shadow-none",
        "whitespace-nowrap text-sm font-semibold tracking-tight text-brand-950",
        "underline-offset-2 transition-opacity hover:opacity-80 hover:underline",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        className,
      )}
      aria-label={`Customer service ${tel}`}
    >
      <span className="min-w-0 max-w-full">
        <HotlineDigits digits={tel} />
      </span>
    </Link>
  );
}
