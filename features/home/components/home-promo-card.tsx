import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

export type HomePromoCardProps = {
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  /** Small label above the title (e.g. «حصرياً») — يُستعمل في `aria-label` فقط (النص داخل الصورة). */
  eyebrow?: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Eager image when this block is likely the main hero-sized visual (e.g. no carousel above). */
  imagePriority?: boolean;
  className?: string;
};

export function HomePromoCard({
  title,
  subtitle,
  href,
  ctaLabel,
  eyebrow,
  imageSrc = "/images/hero-banner.jpg",
  imageAlt = "",
  imagePriority = false,
  className,
}: HomePromoCardProps) {
  const a11yLabel =
    imageAlt?.trim() ||
    [eyebrow, title, subtitle, ctaLabel].filter(Boolean).join(". ");

  return (
    <div className={cn("w-full", className)}>
      {/*
        كل الشاشات: بانر صورة فقط — ارتفاع مُطابق لشرائح الهيرو: ‎`min(400px, 70dvh)`‎
        (انظر ‎`HomeHeroBanner`‎). ‎`aria-label`‎ على الرابط لقارئات الشاشة.
      */}
      <Link
        href={href}
        className="relative block w-full overflow-hidden rounded-2xl border border-black/10 shadow-md"
        aria-label={a11yLabel}
      >
        <div className="relative h-[min(240px,70dvh)] w-full">
          <AppImage
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
            className="object-cover object-center"
            priority={imagePriority}
          />
        </div>
      </Link>
    </div>
  );
}
