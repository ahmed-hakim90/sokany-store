import { AboutAfterSalesSection } from "@/features/about/components/about-after-sales-section";
import { AboutDarkMediaCard } from "@/features/about/components/about-dark-media-card";
import { AboutEditorialHero } from "@/features/about/components/about-editorial-hero";
import { AboutLimeStatRibbon } from "@/features/about/components/about-lime-stat-ribbon";
import { AboutQuoteBlock } from "@/features/about/components/about-quote-block";
import { AboutServiceShowcaseCard } from "@/features/about/components/about-service-showcase-card";
import { AboutStoryboardSection } from "@/features/about/components/about-storyboard-section";
import { AboutTrustQualityCard } from "@/features/about/components/about-trust-quality-card";
import { AboutValueFeatureBlock } from "@/features/about/components/about-value-feature-block";
import { AboutStoryBlock } from "@/features/about/components/AboutStoryBlock";
import { aboutContent } from "@/features/about/content";
import { Container } from "@/components/Container";

/*
 * صفحة من نحن (/about): عمود واحد داخل Container بمسافات رأسية (gap-14…md:gap-20).
 * من الأعلى للأسفل: هيرو → بطاقة ثقة (٣ بلاطات) → ستوري بورد أفقي على الجوال → شريط +10 سنوات
 * → ميديا داكنة (مؤسسة المغربي) → «ليه تختار سوكاني؟» (٤ بلاطات) → رؤيتنا (نص) → صورة + رابط موزّعين
 * → خدمات المغربي → اقتباس ختامي.
 * الاستجابة: الجوال أولاً؛ الستوري بورد scroll-snap أفقي، ومن md شبكة أعمدة.
 */
export function AboutPageContent() {
  return (
    <div className="bg-page pb-6 pt-1 md:pb-12 md:pt-2">
      <Container className="flex flex-col gap-14 sm:gap-16 md:gap-20">
        {/* كل مكوّن أدناه يشغل كامل عرض الحاوية؛ التباعد الرأسي بين المكوّنات فقط */}
        <AboutEditorialHero
          headline={aboutContent.hero.headline}
          imageSrc={aboutContent.hero.imageSrc}
          imageAlt={aboutContent.hero.imageAlt}
        />

        <AboutTrustQualityCard
          title={aboutContent.trust.title}
          body={aboutContent.trust.body}
          tiles={aboutContent.trust.tiles}
        />

        <AboutStoryboardSection
          title={aboutContent.storyboard.title}
          intro={aboutContent.storyboard.intro}
          frames={aboutContent.storyboard.frames}
        />

        <AboutLimeStatRibbon value={aboutContent.limeStat.value} label={aboutContent.limeStat.label} />

        <AboutDarkMediaCard
          title={aboutContent.darkMedia.title}
          subtitle={aboutContent.darkMedia.subtitle}
          imageSrc={aboutContent.darkMedia.imageSrc}
          imageAlt={aboutContent.darkMedia.imageAlt}
        />

        <AboutValueFeatureBlock
          title={aboutContent.value.title}
          body={aboutContent.value.body}
          tiles={aboutContent.value.tiles}
        />

        <AboutStoryBlock title={aboutContent.vision.title} paragraphs={[...aboutContent.vision.paragraphs]} />

        <AboutServiceShowcaseCard
          imageSrc={aboutContent.serviceShowcase.imageSrc}
          imageAlt={aboutContent.serviceShowcase.imageAlt}
          chipHref={aboutContent.serviceShowcase.chipHref}
          chipLabel={aboutContent.serviceShowcase.chipLabel}
        />

        <AboutAfterSalesSection
          title={aboutContent.afterSales.title}
          intro={aboutContent.afterSales.intro}
          rows={aboutContent.afterSales.rows}
          ctaLabel={aboutContent.afterSales.ctaLabel}
          ctaHref={aboutContent.afterSales.ctaHref}
        />

        <AboutQuoteBlock quote={aboutContent.quote.text} attribution={aboutContent.quote.attribution} />
      </Container>
    </div>
  );
}
