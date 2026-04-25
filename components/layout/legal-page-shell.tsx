import { Container } from "@/components/Container";
import { cn } from "@/lib/utils";

type LegalPageShellProps = {
  children: React.ReactNode;
  /** عرض العمود (افتراضي: نفس صفحات الشروط). */
  containerClassName?: string;
};

/**
 * غلاف موحّد لصفحات المعلومات القانونية و«تواصل معنا»: خلفية الصفحة بتدرج خفيف + بطاقة بيضاء بحدود وظل.
 */
export function LegalPageShell({ children, containerClassName }: LegalPageShellProps) {
  return (
    <div className="bg-page bg-gradient-to-b from-page via-[#e8edf5] to-page pb-10 pt-6 md:pb-16 md:pt-10">
      <Container className={cn("mx-auto", containerClassName ?? "max-w-3xl")}>
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
