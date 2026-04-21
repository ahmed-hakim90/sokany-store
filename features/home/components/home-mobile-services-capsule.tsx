"use client";

import { BadgePercent, CreditCard, RotateCcw, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const SERVICES: {
  title: string;
  subtitle: string;
  icon: typeof Truck;
}[] = [
  {
    title: "عروض جديدة",
    subtitle: "مرتبطة بصفحة العروض.",
    icon: BadgePercent,
  },
  {
    title: "ارجاع خلال ١٤ يوما",
    subtitle: "استرداد المشتريات خلال ١٤ يوما.",
    icon: RotateCcw,
  },
  {
    title: "تقسيط مريح",
    subtitle: "اقساط مريحه تصل الي ٢٤ شهرا.",
    icon: CreditCard,
  },
  {
    title: "شحن محلي",
    subtitle: "شحن مجاني للطلبات فوق ٢٠٠٠ جنية",
    icon: Truck,
  },
];

export type HomeMobileServicesCapsuleProps = {
  className?: string;
};

/** أربع خدمات في صف واحد داخل كبسولة — نفس الشكل على كل مقاسات الشاشة. */
export function HomeMobileServicesCapsule({ className }: HomeMobileServicesCapsuleProps) {
  return (
    <section className={cn("w-full", className)} aria-label="مميزات التسوق">
      <div className="flex items-stretch justify-between gap-1 rounded-[24px] border border-gray-100 bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:gap-2 sm:p-2.5 md:gap-3 md:p-3 lg:rounded-[28px]">
        {SERVICES.map(({ title, subtitle, icon: Icon }) => (
          <div
            key={title}
            className="flex min-w-0 flex-1 flex-col items-center justify-center text-center"
          >
            <div
              className="mb-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D9F99D] text-[#213F00] sm:h-11 sm:w-11 md:h-12 md:w-12"
              aria-hidden
            >
              <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px] md:h-6 md:w-6" strokeWidth={1.85} />
            </div>
            <h3 className="text-[10px] font-bold leading-tight text-gray-900 sm:text-xs md:text-sm">
              {title}
            </h3>
            <p className="mt-0.5 line-clamp-2 text-[8px] font-medium leading-snug text-gray-500 sm:text-[10px] md:text-xs">
              {subtitle}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
