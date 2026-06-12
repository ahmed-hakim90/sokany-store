import { ScrollReveal } from "@/components/ScrollReveal";
import { LandingPageHeader } from "@/features/about/components/landing/landing-page-header";
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
 * صفحة "عن سوكاني" — Landing page منفصلة بدون SiteShell.
 * كل قسم full-bleed يتحكم في خلفيته (dark/light/muted).
 */
export function AboutPageContent() {
  return (
    <div className="overflow-x-clip">
      <LandingPageHeader />
      <main id="main-content" className="pt-14">
        <AboutLandingHero />

        <ScrollReveal>
          <AboutLandingWhoWeAre />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingWhyGrid />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingStatsBar />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingStory />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingCategories />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingTrustBlock />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingServiceNetwork />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingFaq />
        </ScrollReveal>

        <ScrollReveal>
          <AboutLandingFinalCta />
        </ScrollReveal>
      </main>
    </div>
  );
}
