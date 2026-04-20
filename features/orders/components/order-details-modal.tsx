"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
import { AppImage } from "@/components/AppImage";
import { IconButton } from "@/components/ui/icon-button";
import { PriceText } from "@/components/ui/price-text";
import type { Order } from "@/features/orders/types";
import { formatPrice } from "@/lib/utils";

export type OrderDetailsModalProps = {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrderDetailsModal({ order, open, onOpenChange }: OrderDetailsModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = requestAnimationFrame(() => {
      closeRef.current?.focus();
    });
    return () => cancelAnimationFrame(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted || !open || !order) {
    return null;
  }

  const dateLabel = new Date(order.dateCreated).toLocaleDateString("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[min(92vh,720px)] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-white shadow-2xl sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border/80 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-lg font-semibold text-brand-950">
              طلب #{order.id}
            </h2>
            <p className="mt-1 text-xs text-brand-900/60">{dateLabel}</p>
          </div>
          <IconButton
            ref={closeRef}
            type="button"
            variant="subtle"
            size="sm"
            aria-label="إغلاق"
            className="shrink-0"
            onClick={() => onOpenChange(false)}
          >
            <CloseIcon />
          </IconButton>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
          <p className="text-sm font-medium text-brand-950">المنتجات</p>
          <ul className="mt-3 space-y-3">
            {order.items.map((line) => (
              <li
                key={line.id}
                className="flex gap-3 rounded-xl border border-border/70 bg-surface-muted/20 p-2.5"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white">
                  <AppImage
                    src={line.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug text-brand-950">{line.name}</p>
                  <p className="mt-1 text-xs text-brand-900/60">الكمية: {line.quantity}</p>
                  <p className="mt-1 text-sm font-semibold text-brand-800">
                    {formatPrice(line.total)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <footer className="shrink-0 border-t border-border/80 px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-brand-900/70">الإجمالي</span>
            <PriceText amount={order.total} emphasized className="text-lg" />
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
