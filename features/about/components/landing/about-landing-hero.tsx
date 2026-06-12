import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { aboutLandingHero } from "@/features/about/content/about-landing-content";
import { ROUTES } from "@/lib/constants";

/*
 * Hero سينمائي داكن — full-bleed zinc-950/brand-950، نص أبيض، CTA ليموني مضيء.
 * الجوال: عمود واحد (نص أولاً ثم الـ collage).
 * md+: عمودان — نص يساراً، collage يميناً.
 */
export function AboutLandingHero() {
  const { h1Before, h1Highlight, h1After, subtitle, secondaryCta, collage } =
    aboutLandingHero;

  return (
    <section
      className="relative flex min-h-[88dvh] items-center overflow-hidden bg-gradient-to-br from-zinc-950 via-brand-950 to-zinc-950"
      aria-labelledby="about-landing-hero-title"
    >
      {/* blobs ديكور */}
      <div
        className="pointer-events-none absolute -start-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 end-0 h-96 w-96 rounded-full bg-brand-400/[0.08] blur-[100px]"
        aria-hidden
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:gap-16">
        {/* نص */}
        <div className="flex flex-col gap-6 md:order-1">
          <span className="w-fit rounded-full border border-brand-500/35 bg-brand-500/10 px-4 py-1.5 text-xs font-bold text-brand-400">
            الوكيل الحصري لسوكاني في مصر
          </span>

          <h1
            id="about-landing-hero-title"
            className="text-pretty text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
          >
            {h1Before}
            <span className="text-brand-400">{h1Highlight}</span>
            {h1After}
          </h1>

          <p className="max-w-lg text-lg leading-relaxed text-white/65">{subtitle}</p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href={ROUTES.PRODUCTS}
              className="rounded-full bg-brand-500 px-8 py-3.5 text-base font-black text-black shadow-[0_0_36px_rgba(132,204,22,0.3)] transition-all hover:bg-brand-400 hover:shadow-[0_0_48px_rgba(132,204,22,0.4)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
            >
              اذهب للمتجر →
            </Link>
            <Link
              href={secondaryCta.href}
              className="rounded-full border border-white/20 px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-white/[0.08] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>

        {/* Collage صور */}
        <div className="grid grid-cols-2 gap-3 md:order-2 sm:gap-4">
          {collage.map((tile, index) => (
            <div
              key={tile.src}
              className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
            >
              <AppImage
                src={tile.src}
                alt={tile.alt}
                fill
                sizes="(max-width: 768px) 45vw, 240px"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
