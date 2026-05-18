"use client";

import { Link } from "next-view-transitions";
import { Headphones, Mail, MessageCircle, Phone } from "lucide-react";
import {
  warrantyLandingCtaRowClass,
  warrantyLandingLeadClass,
  warrantyLandingOutlineCtaClass,
  warrantyLandingPanelClass,
  warrantyLandingPrimaryCtaClass,
  warrantyLandingSectionTitleClass} from "@/features/warranty/components/landing/warranty-landing-surfaces";
import { warrantyLandingSupport } from "@/features/warranty/content/warranty-landing-content";
import { useStoreHotline } from "@/features/store/hooks/useStoreHotline";
import { ROUTES } from "@/lib/constants";
import {
  latinDigitsFromHotline,
  STORE_HOTLINE_FALLBACK,
} from "@/features/store/lib/hotline-digits";
import { cn } from "@/lib/utils";

/*
 * خدمة العملاء — بطاقة كبيرة بالهوت لاين + قنوات؛ أزرار اتصال وواتساب.
 */
export function WarrantyLandingSupport() {
  const { title, subtitle, workingHours, email, whatsappUrl, callLabel, whatsappLabel } =
    warrantyLandingSupport;
  const { data, isPending } = useStoreHotline();
  const hotline = latinDigitsFromHotline(data?.hotline?.trim() || STORE_HOTLINE_FALLBACK);
  const telHref = `tel:${hotline}`;

  return (
    <section className="space-y-6" aria-labelledby="warranty-support-title">
      <div className="space-y-2 text-center md:text-start">
        <h2 id="warranty-support-title" className={warrantyLandingSectionTitleClass}>
          {title}
        </h2>
        <p className={cn("mx-auto max-w-2xl md:mx-0", warrantyLandingLeadClass)}>{subtitle}</p>
      </div>

      <article
        className={cn(
          warrantyLandingPanelClass,
          "overflow-hidden bg-gradient-to-br from-brand-50/60 via-white to-white p-6 sm:p-8",
        )}
      >
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-start">
          <div className="flex shrink-0 flex-col items-center gap-2 md:items-start">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/30 text-brand-950">
              <Phone className="h-7 w-7" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-brand-950/80">الخط الساخن</p>
            <a
              href={telHref}
              className={cn(
                "font-display text-4xl font-black tabular-nums text-brand-900 sm:text-5xl",
                isPending && "animate-pulse text-muted-foreground/70",
              )}
              dir="ltr"
              lang="en"
            >
              {hotline}
            </a>
          </div>

          <ul className="grid w-full max-w-xl flex-1 gap-3 sm:grid-cols-2">
            <SupportChannel icon={Phone} label="اتصل الآن" value={hotline} href={telHref} />
            <SupportChannel
              icon={MessageCircle}
              label="واتساب"
              value="دعم فوري"
              href={whatsappUrl || undefined}
              disabled={!whatsappUrl}
            />
            <SupportChannel icon={Mail} label="البريد" value={email} href={`mailto:${email}`} />
            <SupportChannel icon={Headphones} label="أوقات العمل" value={workingHours} />
          </ul>
        </div>

        <div className={cn("mt-8 justify-center md:justify-start", warrantyLandingCtaRowClass)}>
          <a href={telHref} className={warrantyLandingPrimaryCtaClass}>
            {callLabel}
          </a>
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={warrantyLandingOutlineCtaClass}
            >
              {whatsappLabel}
            </a>
          ) : (
            <Link href={ROUTES.CONTACT} className={warrantyLandingOutlineCtaClass}>
              تواصل معنا
            </Link>
          )}
        </div>
      </article>
    </section>
  );
}

function SupportChannel({
  icon: Icon,
  label,
  value,
  href,
  disabled,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
  disabled?: boolean;
}) {
  const inner = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-brand-800" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-brand-950/70">{label}</p>
        <p className="truncate text-sm font-bold text-brand-950">{value}</p>
      </div>
    </>
  );

  const className = cn(
    warrantyLandingPanelClass,
    "flex items-center gap-3 p-3 text-start transition-colors",
    href && !disabled && "hover:border-brand-700/50 hover:bg-brand-50/40",
    disabled && "opacity-60",
  );

  if (href && !disabled) {
    return (
      <li>
        <a href={href} className={className}>
          {inner}
        </a>
      </li>
    );
  }

  return (
    <li>
      <div className={className}>{inner}</div>
    </li>
  );
}
