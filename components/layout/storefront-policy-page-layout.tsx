import { BrandSupportGrid } from "@/features/support/components/brand-support-grid";
import { cn } from "@/lib/utils";

/*
 * غلاف صفحات السياسات والمحتوى الرسمي:
 * — أعلى: شبكة دعم اختيارية (ضمان، صيانة، فروع…).
 * — أسفل: المحتوى كما هو (WP HTML أو LegalPageShell) دون تعديل الجسم.
 */
export function StorefrontPolicyPageLayout({
  children,
  showSupportGrid = true,
  supportTitle = "الدعم والخدمة",
  supportSubtitle = "اختصارات لأهم صفحات ما بعد الشراء",
  className,
}: {
  children: React.ReactNode;
  showSupportGrid?: boolean;
  supportTitle?: string;
  supportSubtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-8 sm:space-y-10", className)}>
      {showSupportGrid ? (
        <BrandSupportGrid
          title={supportTitle}
          subtitle={supportSubtitle}
          className="px-4 sm:px-6 lg:px-8"
        />
      ) : null}
      {children}
    </div>
  );
}
