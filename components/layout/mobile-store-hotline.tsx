"use client";

import Link from "next/link";
import { useStoreHotline } from "@/features/store/hooks/useStoreHotline";
import { cn } from "@/lib/utils";

const FALLBACK = "17355";

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EXT_ARABIC_INDIC = "۰۱۲۳۴۵۶۷۸۹";

function toLatinDigitChar(ch: string): string | null {
  if (ch >= "0" && ch <= "9") return ch;
  const i = ARABIC_INDIC.indexOf(ch);
  if (i >= 0) return String(i);
  const j = EXT_ARABIC_INDIC.indexOf(ch);
  if (j >= 0) return String(j);
  return null;
}

/** Latin digits only (0–9), for display and `tel:` — supports Arabic-Indic input. */
function latinDigitsFromHotline(value: string): string {
  let out = "";
  for (const ch of value) {
    const d = toLatinDigitChar(ch);
    if (d) out += d;
  }
  return out || FALLBACK;
}

function HotlineDigits({ digits }: { digits: string }) {
  return (
    <span
      dir="ltr"
      lang="en"
      className="inline-flex min-w-0 items-baseline gap-px font-wordmark tabular-nums"
    >
      {digits.split("").map((ch, i) =>
        ch === "3" ? (
          <span
            key={`${i}-${ch}`}
            className="text-lg font-bold leading-none text-red-600 sm:text-xl"
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

export function MobileStoreHotline({ className }: { className?: string }) {
  const { data, isPending } = useStoreHotline();
  const raw = data?.hotline?.trim() || FALLBACK;
  const tel = latinDigitsFromHotline(raw);

  if (isPending) {
    return (
      <span
        className={cn(
          "inline-flex h-11 min-w-0 max-w-full shrink items-center font-wordmark text-sm font-semibold tracking-tight text-muted-foreground/35",
          "animate-pulse",
          className,
        )}
        aria-hidden
        dir="ltr"
        lang="en"
      >
        {FALLBACK}
      </span>
    );
  }

  return (
    <Link
      href={`tel:${tel}`}
      className={cn(
        "inline-flex h-11 min-w-0 max-w-full shrink items-center justify-center rounded-none border-0 bg-transparent p-0 shadow-none",
        "text-sm font-semibold tracking-tight text-brand-950",
        "underline-offset-2 transition-opacity hover:opacity-80 hover:underline",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        className,
      )}
      aria-label={`Customer service ${tel}`}
    >
      <span className="min-w-0 truncate">
        <HotlineDigits digits={tel} />
      </span>
    </Link>
  );
}
