import { Link } from "next-view-transitions";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CatalogPromoTile({ className }: { className?: string }) {
  return (
    <Link
      href={ROUTES.PRODUCTS}
      className={cn(
        "group flex min-h-[280px] min-w-0 flex-col justify-between rounded-editorial bg-brand-950 p-6 text-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 hover:scale-[1.02] sm:min-h-[320px] sm:p-8",
        className,
      )}
    >
      <div>
        <p className="font-display text-xl font-bold leading-snug sm:text-2xl">
          الدقة الهندسية في كل جهاز
        </p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
          تصميم عملي وتفاصيل تقنية تدوم — اكتشف أحدث أجهزة سوكاني.
        </p>
      </div>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-500">
        اكتشف التقنية
        <span aria-hidden className="inline-block transition-transform group-hover:-translate-x-0.5 rtl:rotate-180">
          →
        </span>
      </span>
    </Link>
  );
}
