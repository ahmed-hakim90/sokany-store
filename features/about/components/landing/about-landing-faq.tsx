"use client";

import { Link } from "next-view-transitions";
import {
  aboutLandingInnerContainerClass,
  aboutLandingLeadClass,
  aboutLandingMutedSectionClass,
} from "@/features/about/components/landing/about-landing-surfaces";
import { aboutLandingFaq } from "@/features/about/content/about-landing-content";
import { LandingFaqSection } from "@/features/support/components/landing-faq-section";
import { ROUTES } from "@/lib/constants";

/*
 * الأسئلة الشائعة — قسم muted (slate-50)؛ مرساة #faq للروابط.
 */
export function AboutLandingFaq() {
  return (
    <section className={aboutLandingMutedSectionClass}>
      <div className={aboutLandingInnerContainerClass}>
        <LandingFaqSection
          sectionId="faq"
          titleId="about-faq-title"
          items={aboutLandingFaq}
          footer={
            <p className={aboutLandingLeadClass}>
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
      </div>
    </section>
  );
}
