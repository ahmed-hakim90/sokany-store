"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Product3DViewer } from "@/features/products/components/Product3DViewer";
import type { ProductImage } from "@/features/products/types";
import { cn } from "@/lib/utils";

export type Product3DModalProps = {
  modelSrc: string;
  productName: string;
  posterSrc?: string | null;
  thumbnails?: ProductImage[];
  onClose: () => void;
};

export function Product3DModal({
  modelSrc,
  productName,
  posterSrc,
  thumbnails,
  onClose,
}: Product3DModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const t = requestAnimationFrame(() => closeRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-storefront-modal", "");
    return () => {
      root.removeAttribute("data-storefront-modal");
    };
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2600] flex items-stretch justify-center bg-slate-950/68 p-0 backdrop-blur-[3px] sm:items-center sm:p-5"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default"
        aria-label="إغلاق عارض المنتج ثلاثي الأبعاد"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-[1] flex h-[100svh] w-full flex-col overflow-hidden bg-white text-slate-950 shadow-[0_30px_90px_-36px_rgba(15,23,42,0.85)]",
          "sm:h-auto sm:max-h-[min(92svh,860px)] sm:max-w-6xl sm:rounded-[1.75rem] sm:border sm:border-white/80",
        )}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 border-b border-slate-100 bg-white px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-5 sm:pt-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm">
              <BoxIcon />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">3D View</p>
              <p className="hidden text-xs text-slate-500 sm:block">Interactive preview</p>
            </div>
          </div>

          <div className="min-w-0 text-center">
            <h2
              id={titleId}
              className="truncate font-display text-lg font-black tracking-tight text-slate-950 sm:text-2xl"
            >
              {productName}
            </h2>
            <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
              Explore the product in 3D
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            className="ms-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-[radial-gradient(circle_at_50%_0%,rgba(226,232,240,0.7),transparent_42%),linear-gradient(180deg,#ffffff,#f8fafc)] px-3 py-3 sm:px-5 sm:py-5">
          <Product3DViewer
            modelSrc={modelSrc}
            productName={productName}
            posterSrc={posterSrc}
            thumbnails={thumbnails}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M4 7.5l8 4.5 8-4.5M12 12v9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
