import { Container } from "@/components/Container";
import { surfacePageHeroClass } from "@/lib/storefront-surfaces";
import { cn } from "@/lib/utils";

type LegalPageShellProps = {
  children: React.ReactNode;
  /** عرض العمود (افتراضي: نفس صفحات الشروط). */
  containerClassName?: string;
  /** عنوان رئيسي فوق البطاقة — للصفحات الثابتة الرسمية. */
  heroTitle?: string;
  heroSubtitle?: string;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * غلاف موحّد لصفحات المعلومات القانونية و«تواصل معنا»: خلفية الصفحة بتدرج خفيف + بطاقة بيضاء بحدود وظل.
 */
export function LegalPageShell({
  children,
  containerClassName,
  heroTitle,
  heroSubtitle,
  className,
  ...props
}: LegalPageShellProps) {
  return (
    <div
      className={cn(
        "bg-page bg-gradient-to-b from-page via-[#e8edf5] to-page pb-10 pt-6 md:pb-16 md:pt-10",
        className,
      )}
      {...props}
    >
      <Container className={cn("mx-auto space-y-6", containerClassName ?? "max-w-3xl")}>
        {heroTitle ? (
          <header className={surfacePageHeroClass}>
            <h1 className="font-display text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">
              {heroTitle}
            </h1>
            {heroSubtitle ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {heroSubtitle}
              </p>
            ) : null}
          </header>
        ) : null}
        <div
          className={cn(
            "rounded-editorial border border-border/70 bg-white/95 shadow-[0_8px_32px_-14px_rgba(15,23,42,0.12)]",
            "p-5 sm:p-8 md:p-10",
          )}
        >
          {children}
        </div>
      </Container>
    </div>
  );
}
