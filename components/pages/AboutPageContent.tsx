import { ScrollReveal } from "@/components/ScrollReveal";
import { Container } from "@/components/Container";
import { AboutLandingCategories } from "@/features/about/components/landing/about-landing-categories";
import { AboutLandingFaq } from "@/features/about/components/landing/about-landing-faq";
import { AboutLandingFinalCta } from "@/features/about/components/landing/about-landing-final-cta";
import { AboutLandingHero } from "@/features/about/components/landing/about-landing-hero";
import { AboutLandingServiceNetwork } from "@/features/about/components/landing/about-landing-service-network";
import { AboutLandingStatsBar } from "@/features/about/components/landing/about-landing-stats-bar";
import { AboutLandingStory } from "@/features/about/components/landing/about-landing-story";
import { AboutLandingTrustBlock } from "@/features/about/components/landing/about-landing-trust-block";
import { AboutLandingWhoWeAre } from "@/features/about/components/landing/about-landing-who-we-are";
import { AboutLandingWhyGrid } from "@/features/about/components/landing/about-landing-why-grid";

/*
 * صفحة من نحن (/about) — هبوط SEO لسوكاني مصر + مؤسسة المغربي:
 * — خلفية صفحة `bg-page`، Container بعرض المتجر `max-w-6xl`.
 * — الجوال: أقسام عمودية بمسافات gap-12؛ تمرير أفقي للفئات والجدول الزمني.
 * — md/lg: شبكات عمودين للهيرو والقصة والخدمة؛ FAQ عمودان؛ فئات 4–8 أعمدة.
 * — H1 واحد في الهيرو؛ باقي العناوين H2/H3.
 */
export function AboutPageContent() {
  return (
    <div className="overflow-x-clip bg-page pb-8 pt-2 md:pb-14 md:pt-3">
      <Container className="flex max-w-6xl flex-col gap-12 sm:gap-14 md:gap-16 lg:mx-auto">
        <AboutLandingHero />

        <ScrollReveal>
          <AboutLandingWhoWeAre />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingWhyGrid />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingStory />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingCategories />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingServiceNetwork />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingStatsBar />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingTrustBlock />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingFaq />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingFinalCta />
        </ScrollReveal>
      </Container>
    </div>
  );
}
