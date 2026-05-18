"use client";

import { Link } from "next-view-transitions";
import { warrantyLandingLeadClass } from "@/features/warranty/components/landing/warranty-landing-surfaces";
import { warrantyLandingFaq } from "@/features/warranty/content/warranty-landing-content";
import { LandingFaqSection } from "@/features/support/components/landing-faq-section";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/*
 * الأسئلة الشائعة — نفس أكورديون صفحة من نحن مع روابط ذات صلة في التذييل.
 */
export function WarrantyLandingFaq() {
  return (
    <LandingFaqSection
      titleId="warranty-faq-title"
      items={warrantyLandingFaq}
      footer={
        <p className={cn(warrantyLandingLeadClass)}>
          <Link href={ROUTES.ABOUT} className="font-semibold text-brand-900 underline-offset-2 hover:underline">
            من نحن
          </Link>
          {" · "}
          <Link href={ROUTES.SERVICE_CENTERS} className="font-semibold text-brand-900 underline-offset-2 hover:underline">
            مراكز الصيانة
          </Link>
          {" · "}
          <Link href={ROUTES.CONTACT} className="font-semibold text-brand-900 underline-offset-2 hover:underline">
            تواصل معنا
          </Link>
        </p>
      }
    />
  );
}
