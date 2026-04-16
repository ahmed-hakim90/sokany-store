"use client";

import Link from "next/link";
import { useState } from "react";
import { CONTACT_EMAIL, ROUTES, SITE_NAME } from "@/lib/constants";
import { mockCategories } from "@/features/categories/mock";
import { DesktopShell } from "@/components/layout/desktop-shell";
import { cn } from "@/lib/utils";

const footerLinks = [
  { href: ROUTES.HOME, label: "الرئيسية" },
  { href: ROUTES.PRODUCTS, label: "المنتجات" },
  { href: ROUTES.CART, label: "السلة" },
  { href: ROUTES.CHECKOUT, label: "إتمام الطلب" },
  { href: ROUTES.ABOUT, label: "من نحن" },
  { href: ROUTES.SERVICE_CENTERS, label: "مراكز الخدمة" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  const [openSection, setOpenSection] = useState<string | null>("links");

  const toggle = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <footer className="mt-auto border-t border-border bg-white/70 backdrop-blur-sm">
      <DesktopShell className="py-8 md:py-12">
        {/* Mobile: compact accordion */}
        <div className="space-y-1 md:hidden">
          <div className="border-b border-border/80">
            <button
              type="button"
              className="flex w-full items-center justify-between py-3 text-start font-display text-sm font-semibold text-brand-950"
              aria-expanded={openSection === "links"}
              onClick={() => toggle("links")}
            >
              روابط سريعة
              <Chevron aria-expanded={openSection === "links"} />
            </button>
            {openSection === "links" ? (
              <ul className="space-y-2 pb-3 text-sm text-muted-foreground">
                {footerLinks.map((l) => (
                  <li key={l.href}>
                    <Link className="hover:text-brand-900" href={l.href}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="border-b border-border/80">
            <button
              type="button"
              className="flex w-full items-center justify-between py-3 text-start font-display text-sm font-semibold text-brand-950"
              aria-expanded={openSection === "categories"}
              onClick={() => toggle("categories")}
            >
              التصنيفات
              <Chevron aria-expanded={openSection === "categories"} />
            </button>
            {openSection === "categories" ? (
              <ul className="max-h-48 space-y-2 overflow-y-auto pb-3 text-sm text-muted-foreground">
                {mockCategories.map((c) => (
                  <li key={c.id}>
                    <Link
                      className="hover:text-brand-900"
                      href={ROUTES.CATEGORY(c.slug)}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="border-b border-border/80">
            <button
              type="button"
              className="flex w-full items-center justify-between py-3 text-start font-display text-sm font-semibold text-brand-950"
              aria-expanded={openSection === "service"}
              onClick={() => toggle("service")}
            >
              خدمة العملاء
              <Chevron aria-expanded={openSection === "service"} />
            </button>
            {openSection === "service" ? (
              <div className="space-y-2 pb-3 text-sm text-muted-foreground">
                <p>{CONTACT_EMAIL}</p>
                <p>القاهرة، مصر — دعم العملاء 10:00–18:00.</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden gap-10 md:grid md:grid-cols-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-brand-950">
              روابط
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <Link className="hover:text-brand-900" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-brand-950">
              التصنيفات
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {mockCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    className="hover:text-brand-900"
                    href={ROUTES.CATEGORY(c.slug)}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div id="service">
            <h3 className="font-display text-lg font-semibold text-brand-950">
              خدمة العملاء
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">{CONTACT_EMAIL}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              القاهرة، مصر — دعم العملاء 10:00–18:00.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-5 text-center text-xs text-muted-foreground md:mt-10 md:pt-6">
          © {year} {SITE_NAME}. جميع الحقوق محفوظة.
        </div>
      </DesktopShell>
    </footer>
  );
}

function Chevron({ "aria-expanded": expanded }: { "aria-expanded": boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      className={cn(
        "shrink-0 text-muted-foreground transition-transform duration-200",
        expanded && "-rotate-180",
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
