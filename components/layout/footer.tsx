"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { AppImage } from "@/components/AppImage";
import { Container } from "@/components/Container";
import { MobileAccordionSection } from "@/components/ui/mobile-accordion-section";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { mockCategories } from "@/features/categories/mock";
import { CONTACT_EMAIL, ROUTES, SITE_LOGO_PATH, SITE_NAME } from "@/lib/constants";
import { SOCIAL_LINKS } from "@/lib/social-links";
import { cn } from "@/lib/utils";

const footerLinks = [
  { href: ROUTES.HOME, label: "الرئيسية" },
  { href: ROUTES.PRODUCTS, label: "المنتجات" },
  { href: ROUTES.CART, label: "السلة" },
  { href: ROUTES.CHECKOUT, label: "إتمام الطلب" },
  { href: ROUTES.ABOUT, label: "من نحن" },
  { href: ROUTES.SERVICE_CENTERS, label: "مراكز الخدمة" },
] as const;

/** أقصى عدد تصنيفات يُعرَض في الفوتر؛ الباقي عبر رابط «كل التصنيفات». */
const FOOTER_CATEGORY_LIMIT = 8;

export function Footer() {
  const year = new Date().getFullYear();
  const categoriesQuery = useCategories();
  const categoryList =
    categoriesQuery.data && categoriesQuery.data.length > 0
      ? categoriesQuery.data
      : mockCategories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          image: c.image?.src ?? null,
          count: c.count,
          parentId: c.parent,
        }));

  const footerCategories = useMemo(
    () =>
      [...categoryList]
        .sort((a, b) => b.count - a.count)
        .slice(0, FOOTER_CATEGORY_LIMIT),
    [categoryList],
  );
  return (
    <footer className="mt-auto w-full border-t border-border/80 bg-zinc-50/95 backdrop-blur-sm">
      <Container
        className={cn(
          "mx-auto max-w-7xl py-8 md:py-12",
          "max-md:pb-[calc(120px+env(safe-area-inset-bottom))]",
        )}
      >
        {/* هذا القسم يعمل على الموبايل */}
        {/* hidden هذا القسم يعمل على الموبايل */}
        {/* //اخفاء القسم على الموبايل
        // #hidden-mobile */}
        <div className="space-y-0 hidden  md:hidden">
          <MobileAccordionSection title="التصنيفات">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerCategories.map((c) => (
                <li key={c.id}>
                  <Link className="hover:text-brand-900" href={ROUTES.CATEGORY(c.slug)}>
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  className="font-semibold text-brand-900 hover:underline"
                  href={ROUTES.CATEGORIES}
                >
                  كل التصنيفات
                </Link>
              </li>
            </ul>
          </MobileAccordionSection>
          <MobileAccordionSection title="روابط سريعة">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <Link className="hover:text-brand-900" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </MobileAccordionSection>
          <MobileAccordionSection title="خدمة العملاء">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <a className="hover:text-brand-900" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>القاهرة، مصر — دعم العملاء 10:00–18:00.</p>
            </div>
          </MobileAccordionSection>
          <MobileAccordionSection title="النشرة الإخبارية" noBorder>
            <FooterNewsletter embedded />
          </MobileAccordionSection>
        </div>

        <div className="hidden gap-8 md:grid md:grid-cols-2 md:gap-10 lg:grid-cols-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-brand-950">روابط</h3>
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
            <h3 className="font-display text-lg font-semibold text-brand-950">التصنيفات</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {footerCategories.map((c) => (
                <li key={c.id}>
                  <Link className="hover:text-brand-900" href={ROUTES.CATEGORY(c.slug)}>
                    {c.name}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  className="text-sm font-semibold text-brand-900 hover:underline"
                  href={ROUTES.CATEGORIES}
                >
                  كل التصنيفات
                </Link>
              </li>
            </ul>
          </div>
          <div id="service">
            <h3 className="font-display text-lg font-semibold text-brand-950">خدمة العملاء</h3>
            <p className="mt-3 text-sm text-muted-foreground">{CONTACT_EMAIL}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              القاهرة، مصر — دعم العملاء 10:00–18:00.
            </p>
          </div>
          <FooterNewsletter />
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-border/80  mt-4 pt-4 sm:mt-8 sm:pt-6 ">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white text-brand-800 shadow-sm transition-colors hover:bg-surface-muted/80 hover:text-brand-950"
                aria-label={s.label}
              >
                {s.key === "facebook" ? (
                  <FacebookGlyph className="h-4 w-4" />
                ) : s.key === "instagram" ? (
                  <InstagramGlyph className="h-4 w-4" />
                ) : (
                  <YoutubeGlyph className="h-4 w-4" />
                )}
              </a>
            ))}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white text-brand-800 shadow-sm transition-colors hover:bg-surface-muted/80 hover:text-brand-950"
              aria-label="البريد الإلكتروني"
            >
              <MailGlyph className="h-4 w-4" />
            </a>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="relative h-12 w-28 overflow-hidden sm:h-25 sm:w-50">
              <AppImage src={SITE_LOGO_PATH} alt="" fill sizes="100%" />
            </div>
            {/* <p className="font-display text-xs font-semibold text-brand-950">{SITE_NAME}</p> */}
            <p className="text-xs text-muted-foreground">
              © {year} {SITE_NAME}. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterNewsletter({ embedded }: { embedded?: boolean }) {
  const [done, setDone] = useState(false);
  const fieldId = useId();
  const inputId = `footer-newsletter-${fieldId.replace(/:/g, "")}`;

  return (
    <div>
      {embedded ? null : (
        <h3 className="font-display text-lg font-semibold text-brand-950">النشرة الإخبارية</h3>
      )}
      <p className={cn("text-sm text-muted-foreground", embedded ? "mt-0" : "mt-2")}>
        اشترك لتصلك أحدث العروض والمنتجات الجديدة.
      </p>
      {done ? (
        <p className="mt-3 text-sm font-semibold text-brand-800">شكرًا لاشتراكك.</p>
      ) : (
        <form
          className={cn(
            "mt-3 flex overflow-hidden rounded-xl border border-border bg-white shadow-sm ring-1 ring-black/[0.04]",
            !embedded && "lg:mt-4",
          )}
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <label htmlFor={inputId} className="sr-only">
            البريد الإلكتروني
          </label>
          <input
            id={inputId}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="بريدك الإلكتروني"
            className="min-w-0 flex-1 border-0 bg-zinc-900/[0.06] px-3 py-2.5 text-sm text-brand-950 outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="shrink-0 bg-brand-500 px-3 py-2.5 text-xs font-bold text-black transition-colors hover:bg-brand-400 sm:px-4 sm:text-sm"
          >
            اشتراك
          </button>
        </form>
      )}
    </div>
  );
}

function FacebookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5H17V4.6c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8V11H7v3h2.5v8h4z" />
    </svg>
  );
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M21.6 7.2s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C16 4 12 4 12 4s-4 0-6.7.3c-.4 0-1.3.1-2.1.9-.6.6-.8 2-.8 2S2 8.9 2 10.6v1.7c0 1.7.2 3.4.2 3.4s.2 1.4.8 2c.8.8 1.9.8 2.4.9 1.9.2 6.6.3 6.6.3s4 0 6.7-.3c.4 0 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.2-1.7.2-3.4v-1.7c0-1.7-.2-3.4-.2-3.4zM10 14.5V8.5L15.2 11.5 10 14.5z" />
    </svg>
  );
}

function MailGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 6h16v12H4z" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" />
    </svg>
  );
}
