"use client";

import { Link } from "next-view-transitions";
import { BookOpen, Headphones, HelpCircle, MapPin } from "lucide-react";
import { HomeSectionHeader } from "@/features/home/components/home-section-header";
import { ROUTES } from "@/lib/constants";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

export const BRAND_SUPPORT_TILES = [
  {
    href: ROUTES.WARRANTY,
    label: "طرق الاستخدام",
    description: "دليل الاستخدام ومراكز الخدمة المعتمدة",
    icon: BookOpen,
  },
  {
    href: ROUTES.SERVICE_CENTERS,
    label: "الفروع و الضمان",
    description: "اعثر على أقرب فرع",
    icon: MapPin,
  },
  {
    href: ROUTES.CONTACT,
    label: "تواصل معنا",
    description: "دعم العملاء والاستفسارات",
    icon: Headphones,
  },
  {
    href: ROUTES.TERMS,
    label: "الأسئلة الشائعة",
    description: "إجابات سريعة لأكثر الأسئلة",
    icon: HelpCircle,
  },
] as const;

export type BrandSupportGridProps = {
  className?: string;
  title?: string;
  subtitle?: string;
  titleId?: string;
};

/*
 * شبكة خدمات ما بعد البيع — 4 بلاطات: 2×2 موبايل، صفان من عمودين على sm.
 * تُستخدم في الرئيسية وصفحات الدعم.
 */
export function BrandSupportGrid({
  className,
  title = "خدمات سوكاني الرسمية",
  subtitle = "ضمان الوكيل، صيانة معتمدة، ودعم محلي في مصر",
  titleId = "brand-support-grid-title",
}: BrandSupportGridProps) {
  return (
    <section
      className={cn("space-y-3 sm:space-y-4", className)}
      aria-labelledby={titleId}
    >
      <HomeSectionHeader id={titleId} title={title} subtitle={subtitle} />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
        {BRAND_SUPPORT_TILES.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href + label}
            href={href}
            className={cn(
              surfacePanelClass,
              "flex min-h-[6.5rem] flex-col gap-2 p-3 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--surface-elevated-shadow)] sm:min-h-[7rem] sm:p-4",
            )}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/15 text-brand-900">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-sm font-bold leading-tight text-foreground">{label}</span>
            <span className="text-[11px] leading-snug text-muted-foreground">{description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
