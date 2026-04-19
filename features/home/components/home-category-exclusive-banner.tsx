import { Link } from "next-view-transitions";
import { AppImage } from "@/components/AppImage";
import { ROUTES } from "@/lib/constants";
import type { Category } from "@/features/categories/types";
import { cn } from "@/lib/utils";

const FALLBACK_DESCRIPTION =
  "تصفّح أحدث المنتجات والعروض في هذا القسم — جودة سوكانى وضمان موثوق.";

export type HomeCategoryExclusiveBannerProps = {
  category: Category;
  /** Optional override from `public/images/banner-section/{slug}.*` (server map). */
  sectionBannerSrc?: string | null;
  /** Badge label (e.g. «حصرياً»). */
  badgeText?: string;
  className?: string;
};

export function HomeCategoryExclusiveBanner({
  category,
  sectionBannerSrc = null,
  badgeText = "حصرياً",
  className,
}: HomeCategoryExclusiveBannerProps) {
  const description =
    category.description.trim().length > 0
      ? category.description.trim()
      : FALLBACK_DESCRIPTION;
  const href = ROUTES.CATEGORY(category.slug);
  const imageSrc =
    sectionBannerSrc ?? category.image ?? "/images/placeholder.png";
  const hasRealBannerImage = Boolean(sectionBannerSrc || category.image);

  return (
    <section
      className={cn(
        "relative isolate min-h-[14rem] overflow-hidden rounded-2xl bg-black shadow-lg",
        className,
      )}
      aria-labelledby={`home-cat-banner-${category.id}-title`}
    >
      <div className="absolute inset-0-z-10 md:hidden">
        <AppImage
          src={imageSrc}
          alt=""
          fill
          sizes="100vw"
          className={cn("object-cover ", hasRealBannerImage ? "opacity-35" : "opacity-20")}
        />
        {/* <div className="absolute inset-0 bg-black/25" /> */}
      </div>

      <div className="flex min-h-[14rem] flex-col md:flex-row md:items-stretch">
        {/* <div className="relative z-10 flex flex-1 flex-col justify-center gap-2.5 px-5 py-6 text-right sm:px-8 md:max-w-[52%] md:py-8 lg:px-10">
          <span className="inline-flex w-fit rounded-md bg-sky-400/95 px-2.5 py-1 font-display text-[11px] font-bold text-yellow-300 sm:text-xs">
            {badgeText}
          </span>
          <h2
            id={`home-cat-banner-${category.id}-title`}
            className="font-display text-xl font-bold leading-snug text-white sm:text-2xl md:text-3xl"
          >
            {category.name}
          </h2>
          <p className="max-w-xl text-pretty text-xs leading-relaxed text-zinc-400 sm:text-sm md:text-base">
            {description}
          </p>
          <Link
            href={href}
            className="mt-1 inline-flex w-fit text-sm font-bold text-yellow-300 underline decoration-yellow-300 decoration-2 underline-offset-[5px] transition-colors hover:text-yellow-200 hover:decoration-yellow-200"
          >
            اكتشف الآن
          </Link>
        </div> */}

        <div className="relative min-h-[12rem] flex-1 md:min-h-0 md:block">
          <AppImage
            src={imageSrc}
            alt={hasRealBannerImage ? category.name : ""}
            fill
          
            sizes="(max-width: 767px) 100vw, (max-width: 1280px) 45vw, 520px"
            className={cn(
              "object-cover object-center cover-center",
              !hasRealBannerImage && "opacity-40",
            )}
          />
          {/* <div className="absolute inset-0 bg-gradient-to-l from-black via-black/35 to-transparent" /> */}
        </div>
      </div>
    </section>
  );
}
