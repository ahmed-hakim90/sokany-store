"use client";

import { Link } from "next-view-transitions";
import { useId, useMemo, useState } from "react";
import { AppImage } from "@/components/AppImage";
import { Container } from "@/components/Container";
import { MobileAccordionSection } from "@/components/ui/mobile-accordion-section";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { mockCategories } from "@/features/categories/mock";
import {
  CONTACT_EMAIL,
  ROUTES,
  SITE_LOGO_DISABLED,
  SITE_LOGO_PATH,
  SITE_NAME,
} from "@/lib/constants";
import type { SocialLink } from "@/lib/social-links";
import { SocialGlyph } from "@/components/layout/social-glyph";
import { cn } from "@/lib/utils";

const footerLinks = [
  { href: ROUTES.HOME, label: "الرئيسية" },
  { href: ROUTES.PRODUCTS, label: "المنتجات" },
  { href: ROUTES.CART, label: "السلة" },
  { href: ROUTES.CHECKOUT, label: "إتمام الطلب" },
  { href: ROUTES.MY_ORDERS, label: "طلباتي" },
  { href: ROUTES.MY_REVIEWS, label: "تقييماتي" },
  { href: ROUTES.ABOUT, label: "من نحن" },
  { href: ROUTES.SERVICE_CENTERS, label: "مراكز الخدمة" },
  { href: ROUTES.RETAILERS, label: "الموزعون المعتمدون" },
] as const;

const footerLegalLinks = [
  { href: ROUTES.CONTACT, label: "تواصل معنا" },
  { href: ROUTES.TERMS, label: "الشروط والأحكام" },
  { href: ROUTES.RETURNS_POLICY, label: "سياسة الاسترجاع والاستبدال" },
  { href: ROUTES.WARRANTY, label: "الصيانة والضمان" },
  { href: ROUTES.PRIVACY, label: "سياسة الخصوصية" },
] as const;

/** أقصى عدد تصنيفات يُعرَض في الفوتر؛ الباقي عبر رابط «كل التصنيفات». */
const FOOTER_CATEGORY_LIMIT = 8;

const FOOTER_DEV_CREDIT_HREF = "https://hakimo-cv.vercel.app/hakimo" as const;

export type FooterProps = {
  socialLinks: SocialLink[];
  siteName?: string;
  logoPath?: string;
  logoDisabled?: boolean;
};

export function Footer({
  socialLinks,
  siteName = SITE_NAME,

  logoPath = SITE_LOGO_PATH,
  logoDisabled = SITE_LOGO_DISABLED,
}: FooterProps) {
  const year = new Date().getFullYear();
  const categoriesQuery = useCategories({ per_page: 100 });
  const categoryList =
    categoriesQuery.data && categoriesQuery.data.length > 0
      ? categoriesQuery.data.filter((c) => c.count > 0)
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
          "max-lg:pb-[calc(120px+env(safe-area-inset-bottom))]",
        )}
      >
        {/* موبايل: أكورديونات؛ من md فما فوق: الشبكة الأربعية */}
        <div className="space-y-0 md:hidden">
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
          <MobileAccordionSection title="معلومات قانونية">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {footerLegalLinks.map((l) => (
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
            <h4 className="mt-6 font-display text-sm font-semibold text-brand-950">معلومات قانونية</h4>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {footerLegalLinks.map((l) => (
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
            {socialLinks.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-white text-brand-800 shadow-sm transition-colors hover:bg-surface-muted/80 hover:text-brand-950"
                aria-label={s.label}
              >
                <SocialGlyph socialKey={s.key} className="h-4 w-4" />
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
            {logoDisabled ? (
              <p className="font-display text-sm font-semibold text-brand-950 sm:text-base">
                {siteName}
              </p>
            ) : (
              <div className="relative h-12 w-28 overflow-hidden sm:h-14 sm:w-32">
                <AppImage
                  src={logoPath}
                  alt=""
                  fill
                  sizes="100%"
                  className="object-contain"
                  fetchPriority="low"
                />
              </div>
            )}
            {/* <p className="font-display text-xs font-semibold text-brand-950">{SITE_NAME}</p> */}
            <p className="text-xs text-muted-foreground">
              © {year} {siteName}. جميع الحقوق محفوظة.
            </p>
            <p className="text-xs text-muted-foreground">
              <a
                href={FOOTER_DEV_CREDIT_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 transition-colors hover:text-brand-900 hover:underline"
                aria-label="صُنع بِحُبٍ — hakimo"
              >
                <span
                  className="inline-flex flex-row items-baseline justify-center gap-1.5"
                  dir="rtl"
                >
                  <span>صُنع بـ</span>
                  <span aria-hidden>❤</span>
                  <span className="text-muted-foreground/50" aria-hidden>
                    ·
                  </span>
                  <span
                    className="font-display text-[0.72rem] font-semibold leading-none tracking-tight text-brand-900/90 sm:text-[0.8rem]"
                    dir="ltr"
                    lang="en"
                  >
                    hakimo
                  </span>
                </span>
              </a>
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

function MailGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 6h16v12H4z" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" />
    </svg>
  );
}
