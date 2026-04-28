import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import type { Category } from "@/features/categories/types";
import { cn } from "@/lib/utils";

/*
 * بانر تصنيف (الكتالوج مع ‎?category‎، أقسام أب في الهوم، ‎/categories/[slug]‎):
 * إطار ‎16∶5‎ بعرض كامل؛ ‎object-cover‎ يملأ الإطار دون شرائط فوق/تحت (قد يُقصّ الطرفان إذا اختلفت نسبة المصدر).
 * الاستجابة: ‎`sm`‎ / ‎`md`‎ / ‎`lg`‎ — عرض حاوية الـ Container.
 */
export type HomeCategoryExclusiveBannerProps = {
  category: Category;
  /** Optional override from `public/images/banner-section/{slug}.*` (server map). */
  sectionBannerSrc?: string | null;
  /** مسار اختياري من لوحة التحكم — يجعل البانر قابلاً للنقر بالكامل. */
  bannerHref?: string;
  /** Badge label (e.g. «حصرياً»). */
  badgeText?: string;
  className?: string;
};

function isExternalUrl(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function HomeCategoryExclusiveBanner({
  category,
  sectionBannerSrc = null,
  bannerHref,
  className,
}: HomeCategoryExclusiveBannerProps) {
  const imageSrc =
    sectionBannerSrc ?? category.image ?? "/images/placeholder.png";
  const hasRealBannerImage = Boolean(sectionBannerSrc || category.image);

  return (
    <section
      className={cn(
        "relative isolate w-full overflow-hidden rounded-2xl bg-image-well shadow-lg ring-1 ring-black/[0.06]",
        className,
      )}
      aria-label={category.name}
    >
      <BannerImageBlock
        imageSrc={imageSrc}
        imageAlt={hasRealBannerImage ? category.name : ""}
        dimmed={!hasRealBannerImage}
        bannerHref={bannerHref}
      />
    </section>
  );
}

function BannerImageBlock({
  imageSrc,
  imageAlt,
  dimmed,
  bannerHref,
}: {
  imageSrc: string;
  imageAlt: string;
  dimmed: boolean;
  bannerHref?: string;
}) {
  const inner = (
    <AppImage
      src={imageSrc}
      alt={imageAlt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) min(90vw, 896px), min(72rem, 100vw)"
      className={cn(
        "object-cover object-center",
        dimmed && "opacity-0",
      )}
    />
  );

  const shellClass =
    "relative block aspect-[16/5] w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

  if (!bannerHref?.trim()) {
    return <div className={shellClass}>{inner}</div>;
  }

  const href = bannerHref.trim();
  if (isExternalUrl(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={shellClass}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={shellClass}>
      {inner}
    </Link>
  );
}
