"use client";

import { Link } from "next-view-transitions";
import { aboutLandingLeadClass } from "@/features/about/components/landing/about-landing-surfaces";
import { aboutLandingFaq } from "@/features/about/content/about-landing-content";
import { LandingFaqSection } from "@/features/support/components/landing-faq-section";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/*
 * الأسئلة الشائعة — يعيد استخدام المكوّن المشترك؛ مرساة #faq للروابط من الرئيسية.
 */
export function AboutLandingFaq() {
  return (
    <LandingFaqSection
      sectionId="faq"
      titleId="about-faq-title"
      items={aboutLandingFaq}
      footer={
        <p className={cn(aboutLandingLeadClass)}>
          لمزيد من التفاصيل عن{" "}
          <Link href={ROUTES.WARRANTY} className="font-semibold text-brand-900 underline-offset-2 hover:underline">
            الضمان والصيانة
          </Link>
          {" أو "}
          <Link href={ROUTES.SERVICE_CENTERS} className="font-semibold text-brand-900 underline-offset-2 hover:underline">
            الفروع
          </Link>
          .
        </p>
      }
    />
  );
}
