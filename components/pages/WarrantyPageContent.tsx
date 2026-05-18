import { ScrollReveal } from "@/components/ScrollReveal";
import { Container } from "@/components/Container";
import { WarrantyLandingCoverage } from "@/features/warranty/components/landing/warranty-landing-coverage";
import { WarrantyLandingFaq } from "@/features/warranty/components/landing/warranty-landing-faq";
import { WarrantyLandingFinalCta } from "@/features/warranty/components/landing/warranty-landing-final-cta";
import { WarrantyLandingHero } from "@/features/warranty/components/landing/warranty-landing-hero";
import { WarrantyLandingInternalLinks } from "@/features/warranty/components/landing/warranty-landing-internal-links";
import { WarrantyLandingServiceNetwork } from "@/features/warranty/components/landing/warranty-landing-service-network";
import { WarrantyLandingSpareParts } from "@/features/warranty/components/landing/warranty-landing-spare-parts";
import { WarrantyLandingSteps } from "@/features/warranty/components/landing/warranty-landing-steps";
import { WarrantyLandingSupport } from "@/features/warranty/components/landing/warranty-landing-support";
import { WarrantyLandingWhyGrid } from "@/features/warranty/components/landing/warranty-landing-why-grid";

/*
 * صفحة الضمان والصيانة (/warranty) — هبوط SEO لضمان سوكاني في مصر:
 * — خلفية صفحة `bg-page`، Container بعرض المتجر، مسافات gap-12–16 بين الأقسام.
 * — الجوال: أقسام عمودية؛ خطوات عمودي؛ شبكة قطع غيار تمرير أفقي.
 * — lg: خطوات أفقية؛ FAQ عمودان؛ خريطة الخدمة عمودان.
 * — H1 واحد في الهيرو؛ باقي العناوين H2/H3.
 */
export function WarrantyPageContent() {
  return (
    <div className="overflow-x-clip bg-page pb-8 pt-2 md:pb-14 md:pt-3">
      <Container className="flex max-w-6xl flex-col gap-12 sm:gap-14 md:gap-16 lg:mx-auto">
        <WarrantyLandingHero />

        <WarrantyLandingInternalLinks />

        <ScrollReveal>
          <WarrantyLandingCoverage />
        </ScrollReveal>

        <ScrollReveal>
          <WarrantyLandingSteps />
        </ScrollReveal>

        <ScrollReveal>
          <WarrantyLandingWhyGrid />
        </ScrollReveal>

        <ScrollReveal>
          <WarrantyLandingServiceNetwork />
        </ScrollReveal>

        <ScrollReveal>
          <WarrantyLandingSupport />
        </ScrollReveal>

        <ScrollReveal>
          <WarrantyLandingSpareParts />
        </ScrollReveal>

        <ScrollReveal>
          <WarrantyLandingFaq />
        </ScrollReveal>

        <ScrollReveal>
          <WarrantyLandingFinalCta />
        </ScrollReveal>
      </Container>
    </div>
  );
}
