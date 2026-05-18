"use client";

import { Link } from "next-view-transitions";
import { Sparkles, Tag, TrendingUp } from "lucide-react";
import {
  HomeHeroBanner,
  type HomeHeroBannerProps,
} from "@/features/home/components/home-hero-banner";
import { ROUTES } from "@/lib/constants";
import { surfacePanelClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

const QUICK_CHIPS = [
  { href: ROUTES.OFFERS, label: "عروض الشهر", icon: Tag },
  { href: ROUTES.PRODUCTS, label: "الأكثر مبيعاً", icon: TrendingUp },
  { href: `${ROUTES.PRODUCTS}?orderby=date&order=desc`, label: "وصل حديثاً", icon: Sparkles },
] as const;

const SIDE_PROMOS = [
  {
    href: ROUTES.OFFERS,
    eyebrow: "عروض الشهر",
    title: "خصومات حصرية",
    subtitle: "تصفح أحدث التخفيضات على الأجهزة المختارة",
    accent: "from-brand-400/25 to-brand-500/10",
  },
  {
    href: `${ROUTES.PRODUCTS}?orderby=popularity&order=desc`,
    eyebrow: "الأكثر مبيعاً",
    title: "اختيارات العملاء",
    subtitle: "المنتجات الأعلى طلباً هذا الشهر",
    accent: "from-slate-900/8 to-slate-900/3",
  },
] as const;

export type HomeHeroLayoutProps = HomeHeroBannerProps;

/*
 * الهيرو الرئيسي:
 * — ديسكتوب (‎`lg`‎): بانر كبير + عمود يمين ببطاقتي عروض (شهري / الأكثر مبيعاً).
 * — موبايل: سلايدر أفقي موجود + شريط رقائق إجراءات سريعة تحت الهيرو.
 */
export function HomeHeroLayout({
  slides,
  className,
  ...rest
}: HomeHeroLayoutProps) {
  if (!slides.length) return null;

  return (
    <section className={cn("space-y-3", className)} aria-label="العروض الرئيسية">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-stretch lg:gap-4 xl:grid-cols-[minmax(0,1fr)_19rem] xl:gap-5">
        <div className="min-w-0 lg:rounded-2xl lg:ring-1 lg:ring-black/[0.06]">
          <HomeHeroBanner
            slides={slides}
            className="max-lg:-mx-4 lg:mx-0"
            variant="featured"
            {...rest}
          />
        </div>
        <div className="hidden min-w-0 flex-col gap-3 lg:flex">
          {SIDE_PROMOS.map((promo) => (
            <Link
              key={promo.href}
              href={promo.href}
              className={cn(
                surfacePanelClass,
                "group flex min-h-[9.5rem] flex-1 flex-col justify-between p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md",
                "bg-gradient-to-br",
                promo.accent,
              )}
            >
              <span className="text-[10px] font-bold uppercase tracking-wide text-brand-800">
                {promo.eyebrow}
              </span>
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">{promo.title}</p>
                <p className="text-xs leading-snug text-muted-foreground">{promo.subtitle}</p>
              </div>
              <span className="text-xs font-semibold text-brand-800 group-hover:underline">
                اكتشف الآن ←
              </span>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden">
        {QUICK_CHIPS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              surfacePanelClass,
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-surface-muted/40",
            )}
          >
            <Icon className="h-3.5 w-3.5 text-brand-700" aria-hidden />
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
