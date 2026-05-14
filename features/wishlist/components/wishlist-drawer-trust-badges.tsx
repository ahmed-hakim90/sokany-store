"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function WishlistDrawerTrustBadges({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-2 rounded-2xl bg-surface-muted/40 p-2 text-center text-[10px] font-bold text-slate-600 sm:text-[11px]",
        className,
      )}
      aria-label="مميزات المفضلة"
    >
      <WishlistDrawerTrustBadge icon={<CardIcon />} label="دفع آمن" hint="حماية معلوماتك" />
      <WishlistDrawerTrustBadge icon={<ShieldIcon />} label="ضمان أصلي" hint="منتجات أصلية" />
      <WishlistDrawerTrustBadge icon={<ReturnIcon />} label="إرجاع سهل" hint="خلال 14 يوم" />
    </div>
  );
}

function WishlistDrawerTrustBadge({
  icon,
  label,
  hint,
}: {
  icon: ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1 rounded-xl bg-white px-2 py-2 shadow-sm ring-1 ring-slate-900/[0.06]">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-950 ring-1 ring-brand-900/[0.08]"
        aria-hidden
      >
        {icon}
      </span>
      <span className="truncate text-slate-700">{label}</span>
      <span className="max-w-full truncate text-[9px] font-medium text-muted-foreground sm:text-[10px]">
        {hint}
      </span>
    </div>
  );
}

function CardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M7 15h4" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path
        d="M12 3l7 3v5c0 4.3-2.8 8-7 10-4.2-2-7-5.7-7-10V6l7-3z"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M9 7H5v4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 11a7 7 0 117 7" strokeLinecap="round" />
      <path d="M12 18h-1" strokeLinecap="round" />
    </svg>
  );
}
