"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

const Product3DModal = dynamic(
  () =>
    import("@/features/products/components/Product3DModal").then(
      (m) => m.Product3DModal,
    ),
  { ssr: false, loading: () => null },
);

export type Product3DButtonProps = {
  modelSrc: string | null | undefined;
  productName: string;
  posterSrc?: string | null;
  className?: string;
};

export function Product3DButton({
  modelSrc,
  productName,
  posterSrc,
  className,
}: Product3DButtonProps) {
  const [open, setOpen] = useState(false);

  if (!modelSrc) return null;

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className={cn(
          "group h-12 overflow-hidden border-slate-200 bg-white/85 px-4 text-sm font-extrabold text-slate-950 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.55)] backdrop-blur transition-[transform,background-color,border-color,box-shadow] hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_16px_36px_-24px_rgba(15,23,42,0.65)]",
          className,
        )}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white transition-transform group-hover:scale-105"
          aria-hidden
        >
          <OrbitIcon />
        </span>
        <span className="flex min-w-0 flex-col items-start leading-none">
          <span>360° View</span>
          <span className="mt-1 text-[10px] font-bold text-muted-foreground">
            عرض ثلاثي الأبعاد
          </span>
        </span>
      </Button>

      {open ? (
        <Product3DModal
          modelSrc={modelSrc}
          productName={productName}
          posterSrc={posterSrc}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function OrbitIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.5 12c0-2.4 3.8-4.4 8.5-4.4s8.5 2 8.5 4.4-3.8 4.4-8.5 4.4S3.5 14.4 3.5 12z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M16.4 3.8c1.7 1.7.4 5.8-2.9 9.1s-7.4 4.6-9.1 2.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
