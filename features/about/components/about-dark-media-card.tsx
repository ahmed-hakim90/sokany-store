import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";

export type AboutDarkMediaCardProps = {
  title: string;
  subtitle: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

export function AboutDarkMediaCard({
  title,
  subtitle,
  imageSrc = "/images/hero-banner.jpg",
  imageAlt = "",
  className,
}: AboutDarkMediaCardProps) {
  return (
    <div
      className={cn(
        "relative isolate min-h-[220px] overflow-hidden rounded-[1.35rem] border border-brand-900/25 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.35)] sm:min-h-[260px] md:min-h-[280px]",
        className,
      )}
    >
      <AppImage src={imageSrc} alt={imageAlt} fill sizes="100vw" className="object-cover opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/58 to-black/38" />
      <div className="relative flex h-full min-h-[220px] flex-col justify-end p-8 sm:min-h-[260px] sm:p-10 md:min-h-[280px] md:p-11">
        <h2 className="max-w-[20ch] text-pretty font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
          {title}
        </h2>
        <p className="mt-3 max-w-full text-pretty text-sm leading-relaxed break-words text-white/88 sm:max-w-xl sm:text-[15px]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
