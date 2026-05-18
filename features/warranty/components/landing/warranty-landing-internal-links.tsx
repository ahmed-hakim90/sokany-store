import { Link } from "next-view-transitions";
import { aboutLandingOutlineCtaClass } from "@/features/about/components/landing/about-landing-surfaces";
import { warrantyLandingInternalLinks } from "@/features/warranty/content/warranty-landing-content";
import { cn } from "@/lib/utils";

/*
 * روابط داخلية SEO — شريط اختصارات بعد الهيرو (نفس أزرار الـ CTA الثانوية).
 */
export function WarrantyLandingInternalLinks() {
  return (
    <nav aria-label="صفحات ذات صلة" className="flex flex-wrap justify-center gap-3 sm:justify-start">
      {warrantyLandingInternalLinks.map(({ label, href }) => (
        <Link
          key={href + label}
          href={href}
          className={cn(
            aboutLandingOutlineCtaClass,
            "min-h-10 min-w-0 px-4 py-2 text-xs sm:text-sm",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
