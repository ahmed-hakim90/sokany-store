"use client";

/**
 * فوتر المتجر — هوية Sokany EG: شريط ثقة، روابط RTL، دفع وسوشيال.
 */
import { Link } from "next-view-transitions";
import type { ReactNode } from "react";
import {
  ChevronLeft,
  LockKeyhole,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { AppImage } from "@/components/AppImage";
import { Container } from "@/components/Container";
import { FooterCollapsibleSection } from "@/components/layout/footer-collapsible-section";
import { SocialGlyph } from "@/components/layout/social-glyph";
import { useStoreHotline } from "@/features/store/hooks/useStoreHotline";
import {
  latinDigitsFromHotline,
  STORE_HOTLINE_FALLBACK,
} from "@/features/store/lib/hotline-digits";
import {
  CONTACT_EMAIL,
  ROUTES,
  SITE_LOGO_DISABLED,
  SITE_LOGO_PATH,
  SITE_NAME,
  WHATSAPP_SUPPORT_URL,
} from "@/lib/constants";
import type { SocialLink } from "@/lib/social-links";
import { cn } from "@/lib/utils";

/*
 * تخطيط الفوتر (متجر Sokany — مطابق للمرجع)
 * — شريط خدمات علوي داخل كبسولة عريضة.
 * — أقل من lg: العلامة أولاً → أكورديون الروابط → الدفع/السوشيال → الحقوق.
 * — من lg: شبكة 4 أعمدة RTL (العلامة | تسوق | خدمة العملاء | روابط مهمة).
 * — FooterGate يخفي الفوتر على السلة والمساعد (خارج هذا الملف).
 */

const FOOTER_BRAND_BLURB =
  "أجهزة منزلية بجودة الوكيل في مصر. تسوق بثقة مع دعم محلي وتوصيل لجميع المحافظات.";

const FOOTER_PAYMENT_NOTE =
  "كاش عند الاستلام · بطاقات · فوري · باي موب · شحن لجميع المحافظات";

const FOOTER_NEW_ARRIVALS_HREF = `${ROUTES.PRODUCTS}?${new URLSearchParams({
  orderby: "date",
  order: "desc",
}).toString()}`;

const FOOTER_BESTSELLERS_HREF = `${ROUTES.PRODUCTS}?${new URLSearchParams({
  orderby: "popularity",
  order: "desc",
}).toString()}`;

const FOOTER_SHOP_LINKS = [
  { href: ROUTES.PRODUCTS, label: "كل المنتجات" },
  { href: ROUTES.OFFERS, label: "العروض" },
  { href: FOOTER_BESTSELLERS_HREF, label: "الأكثر مبيعاً" },
  { href: FOOTER_NEW_ARRIVALS_HREF, label: "وصل حديثاً" },
  { href: ROUTES.CATEGORIES, label: "التصنيفات" },
] as const;

const FOOTER_CUSTOMER_LINKS = [
  { href: ROUTES.ORDER_TRACKING, label: "تتبع الطلب" },
  { href: ROUTES.RETURNS_POLICY, label: "سياسة الاستبدال والاسترجاع" },
  { href: ROUTES.WARRANTY, label: "الضمان" },
  { href: ROUTES.SERVICE_CENTERS, label: "الصيانة" },
  { href: ROUTES.CONTACT, label: "تواصل معنا" },
] as const;

const FOOTER_IMPORTANT_LINKS = [
  { href: ROUTES.ABOUT, label: "من نحن" },
  { href: ROUTES.SERVICE_CENTERS, label: "الفروع" },
  { href: ROUTES.RETAILERS, label: "التجار / الموزعين" },
  { href: ROUTES.TERMS, label: "الشروط والأحكام" },
  { href: ROUTES.PRIVACY, label: "سياسة الخصوصية" },
] as const;

type FooterServiceStripItem = {
  label: string;
  description: string;
  icon: typeof Truck | "whatsapp";
  href?: string;
};

const FOOTER_SERVICE_STRIP: readonly FooterServiceStripItem[] = [
  { label: "شحن سريع", description: "لكل المحافظات", icon: Truck },
  { label: "ضمان رسمي", description: "ضمان الوكيل في مصر", icon: ShieldCheck },
  {
    label: "دعم واتساب",
    description: "رد سريع على استفساراتك",
    icon: "whatsapp",
    href: WHATSAPP_SUPPORT_URL || undefined,
  },
  { label: "دفع آمن", description: "عند الاستلام أو أونلاين", icon: LockKeyhole },
];

const footerLinkListClass =
  "space-y-2.5 text-sm text-muted-foreground lg:space-y-4 lg:text-[0.9375rem]";

const footerSocialButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-white text-brand-800 shadow-sm transition-colors hover:border-brand-200 hover:bg-surface-muted/80 hover:text-brand-950";

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

  return (
    <footer className="mt-auto w-full border-t border-border/80 bg-page" dir="rtl">
      <Container
        className={cn(
          "mx-auto max-w-7xl py-6 md:py-9 lg:py-10",
          "max-lg:pb-mobile-footer-commerce",
        )}
      >
        {/* شريط الخدمات — مطابق لكبسولة الثقة في المرجع. */}
        <FooterServiceStrip />

        {/* المحتوى الرئيسي: علامة + 3 أعمدة روابط. */}
        <div className="mt-7 border-t border-border/70 pt-7 lg:mt-10 lg:pt-10">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.28fr_0.84fr_1.06fr_0.92fr] lg:gap-14">
            <div className="order-1 border-b border-border/60 pb-5 lg:border-0 lg:pb-0">
              <FooterBrandBlock
                siteName={siteName}
                logoPath={logoPath}
                logoDisabled={logoDisabled}
              />
            </div>

            <div className="order-2 min-w-0 lg:order-2">
              <FooterCollapsibleSection title="تسوق" titleClassName="lg:text-xl">
                <FooterLinkList items={FOOTER_SHOP_LINKS} />
              </FooterCollapsibleSection>
            </div>

            <div className="order-3 min-w-0 lg:order-3">
              <FooterCollapsibleSection title="خدمة العملاء" titleClassName="lg:text-xl">
                <FooterLinkList items={FOOTER_CUSTOMER_LINKS} />
              </FooterCollapsibleSection>
            </div>

            <div className="order-4 min-w-0 lg:order-4">
              <FooterCollapsibleSection
                title="روابط مهمة"
                titleClassName="lg:text-xl"
                noBorder
              >
                <FooterLinkList items={FOOTER_IMPORTANT_LINKS} />
              </FooterCollapsibleSection>
            </div>
          </div>
        </div>

        {/* الشريط السفلي */}
        <div className="mt-7 grid gap-6 border-t border-border/70 pt-6 lg:mt-10 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-8 lg:pt-7">
          <div className="order-2 lg:order-1">
            <FooterPaymentBadges />
          </div>

          <div className="order-1 text-center lg:order-2">
            <p className="mb-3 text-sm font-semibold text-brand-950">تابعنا</p>
            <FooterSocialRow socialLinks={socialLinks} />
          </div>

          <div className="order-3 space-y-2 text-center text-xs leading-relaxed text-muted-foreground lg:text-start">
            <p>جميع الحقوق محفوظة © {year} {siteName}</p>
            <p>{FOOTER_PAYMENT_NOTE}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterServiceStrip() {
  return (
    <ul
      className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border/80 bg-white/80 shadow-sm shadow-slate-200/70 sm:grid-cols-4"
      aria-label="مزايا التسوق"
    >
      {FOOTER_SERVICE_STRIP.map((item) => {
        const Icon = item.icon === "whatsapp" ? null : item.icon;
        const inner = (
          <>
            <span className="flex min-h-10 min-w-10 items-center justify-center text-[#18a977] lg:min-h-12 lg:min-w-12">
              {item.icon === "whatsapp" ? (
                <SocialGlyph socialKey="whatsapp" className="h-7 w-7 lg:h-8 lg:w-8" />
              ) : Icon ? (
                <Icon className="h-7 w-7 stroke-[1.8] lg:h-8 lg:w-8" aria-hidden />
              ) : null}
            </span>
            <span className="min-w-0 text-center lg:text-start">
              <span className="block text-sm font-bold leading-tight text-brand-950 lg:text-lg">
                {item.label}
              </span>
              <span className="mt-1 block text-[0.75rem] leading-tight text-muted-foreground lg:text-sm">
                {item.description}
              </span>
            </span>
          </>
        );
        const className =
          "flex min-h-20 items-center justify-center gap-2 px-2 py-3 text-brand-950 transition-colors lg:min-h-24 lg:gap-4 lg:px-8";

        if (item.href) {
          return (
            <li
              key={item.label}
              className="min-w-0 border-s border-border/80 first:border-s-0 max-sm:[&:nth-child(n+3)]:border-t max-sm:[&:nth-child(odd)]:border-s-0"
            >
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(className, "hover:bg-white/70")}
              >
                {inner}
              </a>
            </li>
          );
        }

        return (
          <li
            key={item.label}
            className="min-w-0 border-s border-border/80 first:border-s-0 max-sm:[&:nth-child(n+3)]:border-t max-sm:[&:nth-child(odd)]:border-s-0"
          >
            <div className={className}>{inner}</div>
          </li>
        );
      })}
    </ul>
  );
}

function FooterBrandBlock({
  siteName,
  logoPath,
  logoDisabled,
}: {
  siteName: string;
  logoPath: string;
  logoDisabled: boolean;
}) {
  const { data, isPending } = useStoreHotline();
  const raw = data?.hotline?.trim() || STORE_HOTLINE_FALLBACK;
  const hotlineDigits = latinDigitsFromHotline(raw);
  const hotlineTel = `tel:${hotlineDigits}`;

  return (
    <div className="min-w-0 text-center lg:text-start">
      {logoDisabled ? (
        <p className="font-display text-xl font-bold text-brand-950 lg:text-2xl">
          {siteName}
        </p>
      ) : (
        <div className="relative mx-auto h-14 w-48 overflow-hidden lg:mx-0 lg:h-[4.25rem] lg:w-64">
          <AppImage
            src={logoPath}
            alt={siteName}
            fill
            sizes="(max-width: 1023px) 192px, 256px"
            className="object-contain object-center lg:object-start"
            fetchPriority="low"
          />
        </div>
      )}
      <p className="mx-auto mt-4 max-w-sm text-sm leading-8 text-muted-foreground lg:mx-0 lg:text-[1.0625rem]">
        {FOOTER_BRAND_BLURB}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
        <a
          href={hotlineTel}
          className={cn(
            "inline-flex min-h-12 min-w-40 items-center justify-center gap-3 rounded-lg border border-border/80 bg-white px-5 text-lg font-bold text-brand-950 shadow-sm transition-colors hover:bg-surface-muted/80",
            isPending && "animate-pulse text-muted-foreground/70",
          )}
          aria-label={`اتصل بالخط الساخن ${hotlineDigits}`}
        >
          <Phone className="h-5 w-5 shrink-0 text-[#18a977]" aria-hidden />
          <span dir="ltr" lang="en">
            {hotlineDigits}
          </span>
        </a>
      </div>
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="mt-4 inline-block text-sm text-muted-foreground underline-offset-2 hover:text-brand-900 hover:underline lg:text-base"
      >
        {CONTACT_EMAIL}
      </a>
    </div>
  );
}

function FooterLinkList({
  items,
}: {
  items: readonly { readonly href: string; readonly label: string }[];
}) {
  return (
    <ul className={footerLinkListClass}>
      {items.map((l) => (
        <li key={l.href}>
          <Link
            className="group inline-flex min-h-7 items-center gap-3 transition-colors hover:text-brand-900"
            href={l.href}
          >
            <ChevronLeft
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5 group-hover:text-[#18a977]"
              aria-hidden
            />
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function FooterPaymentBadges() {
  return (
    <div className="text-center lg:text-end" aria-label="طرق الدفع">
      <p className="mb-3 text-sm font-semibold text-brand-950">طرق الدفع</p>
      <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
        <PaymentBadge className="text-[#1434CB]">
          <span className="font-sans text-lg font-black italic tracking-tight">VISA</span>
        </PaymentBadge>
        <PaymentBadge>
          <span className="relative flex h-5 w-10 items-center justify-center">
            <span className="absolute right-2 h-5 w-5 rounded-full bg-[#EB001B]" />
            <span className="absolute left-2 h-5 w-5 rounded-full bg-[#F79E1B] mix-blend-multiply" />
          </span>
        </PaymentBadge>
        <PaymentBadge>
          <span className="rounded bg-[#5433A1] px-1.5 py-0.5 text-[0.65rem] font-black leading-none text-white">
            ميزة
          </span>
        </PaymentBadge>
        <PaymentBadge>
          <span className="flex items-center gap-1 font-sans text-[0.62rem] font-bold leading-none text-[#E60000]">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#E60000] text-[0.55rem] text-white">
              V
            </span>
            vodafone
            <span className="text-[0.52rem] text-brand-950">cash</span>
          </span>
        </PaymentBadge>
        <PaymentBadge>
          <span className="flex items-center gap-1 font-sans text-xs font-black text-brand-950">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-brand-950 text-[0.55rem]">
              ج
            </span>
            COD
          </span>
        </PaymentBadge>
      </div>
    </div>
  );
}

function PaymentBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 min-w-16 items-center justify-center rounded-md border border-border/80 bg-white px-3 shadow-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}

function FooterSocialRow({ socialLinks }: { socialLinks: SocialLink[] }) {
  if (socialLinks.length === 0) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label="حسابات التواصل الاجتماعي"
    >
      {socialLinks.map((s) => (
        <a
          key={s.key}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className={footerSocialButtonClass}
          aria-label={s.label}
        >
          <SocialGlyph socialKey={s.key} className="h-3.5 w-3.5" />
        </a>
      ))}
    </div>
  );
}
