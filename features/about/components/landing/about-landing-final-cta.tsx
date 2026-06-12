import { Link } from "next-view-transitions";
import { aboutLandingFinalCta } from "@/features/about/content/about-landing-content";
import { ROUTES } from "@/lib/constants";

/*
 * دعوة ختامية — قسم داكن brand-950/zinc-950 متمركز مع CTA ليموني مضيء.
 */
export function AboutLandingFinalCta() {
  const { title, subtitle, secondaryCta } = aboutLandingFinalCta;

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-zinc-950 to-brand-950 py-24 px-4 sm:py-28 text-center"
      aria-labelledby="about-final-cta-title"
    >
      {/* radial glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(132,204,22,0.08)_0%,transparent_65%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-2xl">
        <h2
          id="about-final-cta-title"
          className="text-4xl font-black leading-tight text-white sm:text-5xl"
        >
          {title}
        </h2>
        <p className="mt-5 text-lg text-white/60 sm:text-xl">{subtitle}</p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href={ROUTES.PRODUCTS}
            className="rounded-full bg-brand-500 px-10 py-4 text-lg font-black text-black shadow-[0_0_48px_rgba(132,204,22,0.35)] transition-all hover:bg-brand-400 hover:shadow-[0_0_64px_rgba(132,204,22,0.45)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400"
          >
            اذهب للمتجر →
          </Link>
          <Link
            href={secondaryCta.href}
            className="rounded-full border border-white/20 px-10 py-4 text-lg font-bold text-white transition-colors hover:bg-white/[0.08] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
          >
            {secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
