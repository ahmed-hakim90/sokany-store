import Link from "next/link";
import { AppImage } from "@/components/AppImage";
import { cn } from "@/lib/utils";
import { CONTACT_EMAIL } from "@/lib/constants";

const bullets = [
  "متابعة بلاغات العطل خلال ساعات العمل الرسمية.",
  "تنسيق مواعيد الصيانة المنزلية عند توفر الخدمة.",
  "الرد على الاستفسارات الفنية العاجلة بالأولوية.",
];

export type ServiceCentersEmergencyCardProps = {
  className?: string;
};

export function ServiceCentersEmergencyCard({ className }: ServiceCentersEmergencyCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl bg-brand-950 text-white shadow-[0_8px_32px_-12px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
        <div className="min-w-0 space-y-4">
          <h2 className="font-display text-xl font-bold leading-snug text-white sm:text-2xl">
            تحتاج مساعدة عاجلة؟
          </h2>
          <ul className="space-y-2.5 text-sm leading-relaxed text-white/85">
            {bullets.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <Link
            href={`mailto:${CONTACT_EMAIL}?subject=دعم%20عاجل%20-%20مراكز%20الخدمة`}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-500 px-5 text-sm font-bold text-black shadow-sm transition-colors hover:bg-brand-400 sm:w-auto"
          >
            تواصل مع الدعم
          </Link>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[200px] shrink-0 overflow-hidden rounded-xl bg-black/30 sm:mx-0 sm:max-w-[220px]">
          <AppImage
            src="/images/placeholder.png"
            alt=""
            fill
            sizes="220px"
            className="object-cover opacity-90"
          />
        </div>
      </div>
    </section>
  );
}
