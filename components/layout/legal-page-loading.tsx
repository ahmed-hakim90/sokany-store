import { LegalPageShell } from "@/components/layout/legal-page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export function LegalPageLoading() {
  return (
    <LegalPageShell
      dir="rtl"
      lang="ar"
      aria-busy="true"
      aria-live="polite"
      aria-label="جاري تحميل الصفحة"
    >
      <header className="mb-6 border-b border-border/80 pb-6 sm:mb-8">
        <Skeleton className="mr-auto h-8 w-56 max-w-[80%] sm:h-9" />
      </header>

      <div className="space-y-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <section key={index} className="space-y-3">
            <Skeleton className="mr-auto h-6 w-40 max-w-[70%]" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </section>
        ))}
      </div>
    </LegalPageShell>
  );
}
