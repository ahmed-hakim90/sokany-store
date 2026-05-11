"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Product3DViewer } from "@/features/products/components/Product3DViewer";
import { cn } from "@/lib/utils";

export type Product3DModalProps = {
  modelSrc: string;
  productName: string;
  posterSrc?: string | null;
  onClose: () => void;
};

export function Product3DModal({
  modelSrc,
  productName,
  posterSrc,
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
      className="fixed inset-0 z-[2600] flex items-stretch justify-center bg-black/45 p-0 backdrop-blur-md sm:items-center sm:p-5"
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
          "relative z-[1] flex h-[100svh] w-full flex-col overflow-hidden bg-slate-950 text-white shadow-2xl",
          "sm:h-auto sm:max-h-[min(92svh,860px)] sm:max-w-6xl sm:rounded-[2rem] sm:border sm:border-white/15",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 bg-white/[0.06] px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur sm:px-5 sm:pt-4">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-300">
              360° Product Experience
            </p>
            <h2
              id={titleId}
              className="mt-1 truncate font-display text-lg font-black tracking-tight sm:text-2xl"
            >
              {productName}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-[radial-gradient(circle_at_50%_0%,rgba(250,204,21,0.14),transparent_34%),linear-gradient(180deg,rgba(15,23,42,1),rgba(2,6,23,1))] px-3 py-3 sm:px-5 sm:py-5">
          <Product3DViewer
            modelSrc={modelSrc}
            productName={productName}
            posterSrc={posterSrc}
          />
        </div>
      </div>
    </div>,
    document.body,
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
